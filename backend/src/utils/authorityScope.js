const categoryDepartmentMap = {
  'Roads & Potholes': 'Public Works Department (Roads)',
  'Garbage & Sanitation': 'Solid Waste & Sanitation Department',
  'Streetlights': 'Municipal Electrical & Lighting Division',
  'Water Supply': 'Water Supply & Jal Board',
  'Drainage': 'Stormwater Drainage & Sewerage Board',
  'Public Spaces': 'Parks & Public Amenities Directorate',
  'Other Issues': 'Central Civic Redressal Cell'
};

const departmentCategoryMap = {
  'Public Works Department (Roads)': 'Roads & Potholes',
  'Solid Waste & Sanitation Department': 'Garbage & Sanitation',
  'Municipal Electrical & Lighting Division': 'Streetlights',
  'Water Supply & Jal Board': 'Water Supply',
  'Stormwater Drainage & Sewerage Board': 'Drainage',
  'Parks & Public Amenities Directorate': 'Public Spaces',
  'Central Civic Redressal Cell': 'Other Issues'
};

/**
 * Resolves the authorized query scope for an authority user.
 * - Upper authority (authority_admin): Organization-wide access (no category/dept constraint).
 * - Lower authority (authority_category or authority with category/dept): Strictly constrained
 *   to complaints belonging to their assigned category or assigned department.
 */
const getAuthorityComplaintScope = (user) => {
  if (!user) {
    return { _id: null };
  }

  // Upper municipal authority: organization-wide scope
  if (user.role === 'authority_admin') {
    return {};
  }

  // Lower municipal authority (handles both authority_category and authority)
  if (['authority_category', 'authority'].includes(user.role)) {
    const orConditions = [];
    if (user.assignedCategory && typeof user.assignedCategory === 'string' && user.assignedCategory.trim()) {
      orConditions.push({ category: user.assignedCategory.trim() });
    }
    if (user.department && typeof user.department === 'string' && user.department.trim()) {
      orConditions.push({ assignedDepartment: user.department.trim() });
      // Also map department to standard category if applicable
      const matchedCategory = Object.keys(categoryDepartmentMap).find(
        cat => categoryDepartmentMap[cat] === user.department.trim()
      );
      if (matchedCategory && matchedCategory !== user.assignedCategory) {
        orConditions.push({ category: matchedCategory });
      }
    }

    if (orConditions.length === 1) {
      return orConditions[0];
    } else if (orConditions.length > 1) {
      return { $or: orConditions };
    }
  }

  // Fallback: If lower authority has neither category nor department assigned, or unauthorized role, deny data
  return { _id: null };
};

/**
 * Checks whether a specific complaint is authorized for a given authority user.
 * - Upper authority (authority_admin): Organization-wide access (true).
 * - Lower authority: Allowed if complaint matches their assigned category or assigned department.
 */
const isComplaintAuthorizedForAuthority = (user, complaint) => {
  if (!user || !complaint) return false;
  if (user.role === 'authority_admin') return true;

  if (['authority_category', 'authority'].includes(user.role)) {
    const cat = complaint.category ? complaint.category.trim() : '';
    const dept = complaint.assignedDepartment ? complaint.assignedDepartment.trim() : '';

    if (user.assignedCategory && cat === user.assignedCategory.trim()) {
      return true;
    }
    if (user.department && dept === user.department.trim()) {
      return true;
    }
    const matchedCategory = Object.keys(categoryDepartmentMap).find(
      c => categoryDepartmentMap[c] === user.department?.trim()
    );
    if (matchedCategory && cat === matchedCategory) {
      return true;
    }
  }

  return false;
};

module.exports = {
  categoryDepartmentMap,
  departmentCategoryMap,
  getAuthorityComplaintScope,
  isComplaintAuthorizedForAuthority
};
