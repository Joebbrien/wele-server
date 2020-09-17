const yup = require("yup");

module.exports.validateUser = async (user)=>{
  try {
    const userSchema = yup.Object().shape({
      firstName: yup.string().trim().required(),
      lastName: yup.string().trim().required(),
      userEmail: yup.email().required(),
      userPassword: yup.string().trim().required(),
      userPhone: yup.number().max(12).min(12).required()
    })

    return await userSchema.isValid(user);

  } catch (error) {
    return false;
  }
}
