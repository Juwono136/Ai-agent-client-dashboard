import crypto from "crypto";
import { Op } from "sequelize"; // Penting untuk Search & Filter
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import sendEmail from "../utils/emailService.js";
import { getWelcomeTemplate } from "../utils/emailTemplates.js";

// @desc    Create User (Admin Invite)
// @route   POST /api/users
export const createUser = async (req, res, next) => {
  try {
    const { name, email, role, subscriptionMonths, n8nWebhookUrl, platformSessionLimit } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError("Email ini sudah terdaftar dalam sistem.", 400));
    }

    // Customer wajib punya masa berlaku: trial 7 hari atau langganan (1-12 bulan)
    if (role === "customer") {
      const validSubscription =
        subscriptionMonths === "trial" ||
        (subscriptionMonths !== undefined &&
          subscriptionMonths !== "" &&
          !Number.isNaN(parseInt(subscriptionMonths, 10)) &&
          parseInt(subscriptionMonths, 10) >= 0 &&
          parseInt(subscriptionMonths, 10) <= 12);
      if (!validSubscription) {
        return next(
          new AppError("Pilih masa berlaku: Uji Coba 7 Hari atau durasi langganan (1-12 bulan).", 400),
        );
      }
    }

    // Generate Secure Random Password
    const randomHex = crypto.randomBytes(4).toString("hex");
    const tempPassword = `${randomHex}Vlow!`; // Contoh: a1b2c3d4Vlow!

    // Calculate subscription expiry date (only for customer)
    let subscriptionExpiry = null;
    let isTrial = false;
    if (role === "customer" && subscriptionMonths !== undefined && subscriptionMonths !== "") {
      if (subscriptionMonths === "trial") {
        // Uji coba 7 hari: berakhir 7 hari dari sekarang (akhir hari)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        expiryDate.setHours(23, 59, 59, 999);
        subscriptionExpiry = expiryDate;
        isTrial = true;
      } else {
        const months = parseInt(subscriptionMonths, 10);
        // TESTING: Handle opsi 1 hari untuk testing (value = 0)
        if (months === 0) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 1);
          expiryDate.setHours(23, 59, 59, 999);
          subscriptionExpiry = expiryDate;
        } else if (months >= 1 && months <= 12) {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + months);
          subscriptionExpiry = expiryDate;
        }
      }
    }

    // Limit koneksi platform (1-10) hanya untuk customer; default 5 jika tidak dikirim
    const sessionLimit =
      role === "customer"
        ? Math.min(10, Math.max(1, parseInt(platformSessionLimit, 10) || 5))
        : null;

    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role: role || "customer",
      isFirstLogin: true,
      isActive: true,
      n8nWebhookUrl: n8nWebhookUrl || null,
      subscriptionExpiry: subscriptionExpiry,
      isTrial: isTrial,
      platformSessionLimit: sessionLimit,
    });

    // Kirim Email Welcome
    const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`;
    const emailHtml = getWelcomeTemplate(name, email, tempPassword, loginUrl);

    let emailStatus = "Sent";
    try {
      await sendEmail({
        email: user.email,
        subject: "Selamat Datang di Vlow.ai - Kredensial Akses",
        html: emailHtml,
      });
    } catch (error) {
      emailStatus = "Failed";
      // Log error internal, tapi jangan fail request creation user
      console.error("Email Error:", error.message);
    }

    // Reload user to get all fields including subscriptionExpiry
    await user.reload();

    res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan dan email undangan telah dikirim.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        isActive: user.isActive,
        subscriptionExpiry: user.subscriptionExpiry,
        isTrial: user.isTrial ?? false,
        n8nWebhookUrl: user.n8nWebhookUrl,
        platformSessionLimit: user.platformSessionLimit,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Users (Search, Filter, Sort, Pagination)
// @route   GET /api/users
export const getAllUsers = async (req, res, next) => {
  try {
    // 1. Setup Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 2. Setup Sorting
    const sortBy = req.query.sortBy || "createdAt"; // Default sort by tanggal buat
    const order = req.query.order || "DESC"; // Default Descending (Terbaru)

    // 3. Setup Filtering & Searching
    const { search, role, isActive } = req.query;
    const whereClause = {};

    // Filter by Role
    if (role) {
      whereClause.role = role;
    }

    // Filter by Active Status
    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    // Search (Case Insensitive di PostgreSQL menggunakan Op.iLike)
    // Jika DB anda MySQL gunakan Op.like
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // 4. Execute Query
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpire"] },
      order: [[sortBy === "subscriptionExpiry" ? "subscriptionExpiry" : sortBy, order]],
      limit: limit,
      offset: offset,
    });

    // 5. Build Response Meta
    res.status(200).json({
      success: true,
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page * limit < count,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single User
// @route   GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpire"] },
    });

    if (!user) {
      return next(new AppError("User tidak ditemukan.", 404));
    }

    // Don't send n8nWebhookUrl to customer (security)
    const userData = user.toJSON();
    if (userData.role === "customer") {
      delete userData.n8nWebhookUrl;
    }

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update User
// @route   PUT /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive, subscriptionMonths, n8nWebhookUrl, platformSessionLimit } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new AppError("User tidak ditemukan.", 404));
    }

    // Proteksi: Admin tidak boleh menonaktifkan diri sendiri
    if (req.user.id === user.id && isActive === false) {
      return next(new AppError("Anda tidak dapat menonaktifkan akun sendiri.", 400));
    }

    // Update fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (n8nWebhookUrl !== undefined) user.n8nWebhookUrl = n8nWebhookUrl || null;

    // Limit koneksi platform (1-10) hanya untuk customer
    if (role === "customer" && platformSessionLimit !== undefined) {
      const parsed = parseInt(platformSessionLimit, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > 10) {
        return next(new AppError("Limit koneksi platform harus antara 1 dan 10.", 400));
      }
      user.platformSessionLimit = parsed;
    } else if (role !== "customer") {
      user.platformSessionLimit = null;
    }

    // Handle subscription expiry (only for customer)
    if (role === "customer" && subscriptionMonths !== undefined) {
      if (subscriptionMonths && subscriptionMonths !== "") {
        if (subscriptionMonths === "trial") {
          // Beri/perpanjang trial 7 hari dari sekarang (akhir hari)
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7);
          expiryDate.setHours(23, 59, 59, 999);
          user.subscriptionExpiry = expiryDate;
          user.isTrial = true;
        } else {
          const months = parseInt(subscriptionMonths, 10);
          // TESTING: Handle opsi 1 hari untuk testing (value = 0)
          if (months === 0) {
            const baseDate = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()
              ? new Date(user.subscriptionExpiry)
              : new Date();
            const expiryDate = new Date(baseDate);
            expiryDate.setDate(expiryDate.getDate() + 1);
            expiryDate.setHours(23, 59, 59, 999);
            user.subscriptionExpiry = expiryDate;
          } else if (months >= 1 && months <= 12) {
            const baseDate = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date()
              ? new Date(user.subscriptionExpiry)
              : new Date();
            const expiryDate = new Date(baseDate);
            expiryDate.setMonth(expiryDate.getMonth() + months);
            user.subscriptionExpiry = expiryDate;
          }
          user.isTrial = false; // Langganan berbayar bukan trial
        }
      } else {
        user.subscriptionExpiry = null;
        user.isTrial = false;
      }
    } else if (role !== "customer") {
      user.subscriptionExpiry = null;
      user.isTrial = false;
    }

    await user.save();

    // Reload user to get updated data
    await user.reload();

    res.status(200).json({
      success: true,
      message: "Data user berhasil diperbarui.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        subscriptionExpiry: user.subscriptionExpiry,
        isTrial: user.isTrial ?? false,
        n8nWebhookUrl: user.n8nWebhookUrl,
        platformSessionLimit: user.platformSessionLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete User
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return next(new AppError("User tidak ditemukan.", 404));
    }

    // Proteksi: Admin tidak boleh menghapus diri sendiri
    if (req.user.id === user.id) {
      return next(new AppError("Anda tidak dapat menghapus akun sendiri.", 400));
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: `User ${user.name} berhasil dihapus permanen.`,
    });
  } catch (error) {
    next(error);
  }
};
