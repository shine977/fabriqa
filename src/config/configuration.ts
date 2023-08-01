export default () => ({
  jwt: {
    publicKey: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES,
    },
    global: true,
  },
});
