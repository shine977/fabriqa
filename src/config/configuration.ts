export default () => ({
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  jwt: {
    secretOrPrivateKey: process.env.JWT_ACCESS_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES,
    },
    global: true,
  },
});
