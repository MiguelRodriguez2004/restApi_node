import { Router } from "express";
import { methods as vetController } from "./../controllers/vet.controller";

const router = Router();

router.get("/", vetController.getAll);
router.get("/:history_id", vetController.getAllId);
router.post("/", vetController.addVet);
router.put("/:history_id", vetController.updateVet);
router.delete("/:history_id", vetController.deleteVet);


export default router;

