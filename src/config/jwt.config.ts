//   secret: process.env.JWT_SECRET,
export default () => ({
  secretOrPrivateKey: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES,
  },
  global: true,
});
