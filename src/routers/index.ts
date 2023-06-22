import { Router } from "express";
import  {PrismaClient } from '@prisma/client'
import User from "../controllers/User";




const router= Router()
const prisma = new PrismaClient()
router.get("/users",User.Get);
router.get("/users/:id",User.GetId);
router.post("/register",User.SignUp);
router.post("/login",User.SignIn);

async function main() {
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})

export default router