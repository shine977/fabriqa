export default () => ({
  jwt: {
    secretOrPrivateKey: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES,
    },
    global: true,
  },
});
