// const { handleValidationError } = require("../errors/validation");
const types = ["string", "emun", "array"];
const errors = {};

const isString = (key, value) => {
  if (typeof value === "string") {
    return true;
  } else {
    if (key in errors) {
      errors[key] += "& Should be a valid string";
    } else {
      errors[key] = "Should be a valid string";
    }
    return false;
  }
};

const isRequired = (key, value) => {
  if (value) {
    return true;
  } else {
    if (key in errors) {
      errors[key] += "& Can't be empty";
    } else {
      errors[key] = "Cant't be empty";
    }
    return false;
  }
};
const isEnum = (key, value, values) => {
  if (values.includes(value)) {
    return true;
  }
  if (key in errors) {
    errors[key] += "& ENUM values should be one of " + values.toString();
  } else {
    errors[key] = "ENUM values should be one of " + values.toString();
  }
  return false;
};

const isArray = (key, value, type) => {
  if (Array.isArray(value)) {
    checkType = true;
    value.forEach((elem) => {
      if (typeof elem != type) {
        checkType = false;
        if (key in errors) {
          errors[key] += "& All entries should be a valid " + type;
        } else {
          errors[key] = "All entries should be a valid " + type;
        }
        return checkType;
      }
    });

    return true;
  } else {
    if (key in errors) {
      errors[key] += " & Should be an array ";
    } else {
      errors[key] = "Should be an array ";
    }
  }
  return false;
};

const isUniqueCheck = (key, value) => {
  duplicates = value.filter(
    (currentValue, currentIndex) => value.indexOf(currentValue) !== currentIndex
  );

  if (duplicates.length != 0) {
    if (key in errors) {
      errors[key] += " & Should be Unique";
    } else {
      errors[key] += "Should be Unique ";
    }
    return false;
  } else {
    return true;
  }
};

const makeValidation = (payload, checks) => {
  let isStringCheck = true;
  let isRequiredCheck = true;
  let isEnumCheck = true;
  let isArrayCheck = true;
  let isUnique = true;
  let hasError = false;
  let res = {};

  for (const [key, value] of Object.entries(checks)) {
    if (value.type === "string") {
      val = payload[key];
      isStringCheck = isString(key, val);
    }
    if (value.isRequired === true) {
      val = payload[key];
      isRequiredCheck = isRequired(key, val);
    }

    if (value.type === "enum") {
      val = payload[key];
      const values = checks[key]["values"];
      isEnumCheck = isEnum(key, val, values);
    }

    if (value.type === "array") {
      val = payload[key];
      data_type = checks[key]["data_type"];
      isArrayCheck = isArray(key, val, data_type);

      if (isArrayCheck && value.isUnique === true) {
        val = payload[key];
        isUnique = isUniqueCheck(key, val);
      }
    }
    if (
      !(
        isStringCheck &&
        isRequiredCheck &&
        isEnumCheck &&
        isArrayCheck &&
        isUnique
      )
    ) {
      hasError = true;
    }
  }

  if (hasError) {
    res = {
      success: false,
      code: 5000,
      message: "Kindly fix error(s)",
      data: errors,
    };
  } else {
    res = {
      success: true,
      message: "No validation error",
      checks: checks,
    };
  }
  return res;
};

module.exports = makeValidation;
