import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  default_password: process.env.DEFAULT_PASSWORD,
  // backend_base_url:process.env.BACKEND_BASE_URL,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  backend_base_url: process.env.BACKEND_BASE_URL,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: process.env.EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender: {
    email: process.env.MAIL,
    app_pass: process.env.MAIL_PASS,
  },

  aws: {
    do_space_endpoint: process.env.DO_SPACE_ENDPOINT,
    do_space_secret_key: process.env.DO_SPACE_SECRET_KEY,
    do_space_access_key: process.env.DO_SPACE_ACCESS_KEY,
    do_space_bucket: process.env.DO_SPACE_BUCKET,
  },
};
