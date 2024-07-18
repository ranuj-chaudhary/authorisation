import bcrypt from "bcrypt";


const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";

const salt = bcrypt.genSaltSync(saltRounds);
const hash = bcrypt.hashSync("1234564564", salt);

console.log(salt, hash);
