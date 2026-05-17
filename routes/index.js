/* ***********************
 * routes/index.js — Week 1 Route Definitions
 *
 * Maps URL paths + HTTP verbs to controller functions.
 * Pattern: router.METHOD('/path', controllerFunction)
 *
 * Week 2 will add separate route files (e.g., routes/inventoryRoute.js)
 * and import them here, keeping this file as the central hub.
 * *********************** */
import { Router } from 'express'
import * as baseCtrl from '../controllers/baseController.js'
import * as categoriesCtrl from '../controllers/categoriesController.js'

const router = Router()

// Home — landing page
router.get('/', baseCtrl.buildHome)

// Organizations — list of tech charity organizations with images
router.get('/organizations', baseCtrl.buildOrganizations)

// Projects — placeholder page (Week 2 adds database-driven project list)
router.get('/projects', baseCtrl.buildProjects)

// Categories — named per the learning activity naming convention
router.get('/categories', categoriesCtrl.buildCategories)

export default router
