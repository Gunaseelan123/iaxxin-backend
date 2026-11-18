import Company from "../models/companyModel.js";
import Lead from "../models/leadsModel.js";

export const getCompanies = async (req, res, next) => {
  try {
    const { search, industry } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
      ];
    }

    if (industry && industry !== "ALL") {
      query.industry = industry;
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      const error = new Error("Company not found");
      error.status = 404;
      throw error;
    }

    const associatedLeads = await Lead.find({ company: company.name })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      company,
      associatedLeads,
    });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const { name, industry, location, phone, website } = req.body;

    if (!name || !industry || !location) {
      const error = new Error("Name, industry, and location are required");
      error.status = 400;
      throw error;
    }

    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      const error = new Error("Company with this name already exists");
      error.status = 409;
      throw error;
    }

    const company = await Company.create({
      name: name.trim(),
      industry: industry.trim(),
      location: location.trim(),
      phone: phone ? phone.trim() : "",
      website: website ? website.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      company,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const oldCompany = await Company.findById(req.params.id);

    if (!oldCompany) {
      const error = new Error("Company not found");
      error.status = 404;
      throw error;
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (req.body.name && req.body.name !== oldCompany.name) {
      await Lead.updateMany(
        { company: oldCompany.name },
        { company: req.body.name }
      );
    }

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      const error = new Error("Company not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
