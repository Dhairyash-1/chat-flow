import { requireAuth } from "@clerk/express"
import { getOnlineUsers } from "../controllers/user.controller"
import { Router } from "express"

const router = Router()

router.use(requireAuth())

router.route("/online").get(getOnlineUsers)

export default router
