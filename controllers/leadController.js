import Lead from "../models/leadsModel.js";

export const getLeads = async (req, res, next) => {
  try {
    const { search, status, leadType, company, assignedTo, communication } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { communication: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (leadType && leadType !== "ALL") {
      query.leadType = leadType;
    }

    if (company && company !== "ALL") {
      query.company = company;
    }

    if (assignedTo && assignedTo !== "ALL") {
      query.assignedTo = assignedTo;
    }

    if (communication && communication !== "ALL") {
      query.communication = communication;
    }

    query.isDeleted = { $ne: true };

    const leads = await Lead.find(query).populate('assignedTo', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      const error = new Error("Lead not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const { name, email, status, leadType, dueDate, assignedTo, company, communication } = req.body;

    if (!name || !email || !assignedTo || !company) {
      const error = new Error("Name, email, assignedTo, and company are required");
      error.status = 400;
      throw error;
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      status: status || "New",
      leadType: leadType || "Inbound",
      dueDate: dueDate || "",
      assignedTo: assignedTo,
      company: company.trim(),
      communication: communication || "Call",
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      const error = new Error("Lead not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      const error = new Error("Status is required");
      error.status = 400;
      throw error;
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      const error = new Error("Lead not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!lead) {
      const error = new Error("Lead not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
