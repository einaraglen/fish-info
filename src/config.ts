import dotenv from "dotenv";
import * as path from "path";

const variables = [
  "DATABASE_URL",
];

const config = async () => {
  await dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
  });

  const missing_env = variables.reduce<boolean>(
    (res: boolean, curr: string) => {
      if (!process.env[curr]) {
        console.error(`Missing required "${curr}" parameter`);
        return true;
      }
      return res;
    },
    false
  );

  if (missing_env) process.exit(1);
};

export default config;
