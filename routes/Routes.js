const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const LoginController = require("../controllers/LoginController");
const RoleController = require("../controllers/RoleController");
const OrganizationController = require("../controllers/OrganizationController");
const { verifyToken } = require("../Validation/Validation");
const JobsController = require("../controllers/JobsController");
const EmailController = require("../controllers/EmailController");
const NotificationController = require("../controllers/NotificationController");
const { applyJob } = require("../controllers/ApplyController");
const authRoutes = require("./auth");
const tokenRoutes = require("./tokenRoutes");
const eventRoutes = require("./eventRoutes");
const eventRegistrationRoutes = require("./eventRegistrationRoutes");
const workshopRoutes = require("./workshopRoutes");
const workshopRegistrationRoutes = require("./workshopRegistrationRoutes");
const courseRoutes = require("./courseRoutes");
const blogRoutes = require("./blogRoutes");



// ...
router.use("/events", eventRoutes);


// Login module APIs
router.post("/login", LoginController.login);

// User module APIs
router.get("/getUsers", userController.getUsers);
router.post("/createUser", userController.createUser);
router.put("/updateUser/:id", userController.updateUser);
router.delete("/deleteUser/:id", userController.deleteUser);

// Role module APIs
router.get("/getRoles", RoleController.getRoles);

//Organization module APIs
router.get(
  "/organization/type/get",
  OrganizationController.getOrganizationTypes
);

//Job module APIs
router.post("/job/nature/add", verifyToken, JobsController.insertJobNature);
router.get("/job/getJobNature", verifyToken, JobsController.getJobNature);
router.post(
  "/job/workplace-type/add",
  verifyToken,
  JobsController.insertWorkPlaceType
);
router.get(
  "/job/workplace-type/get",
  verifyToken,
  JobsController.getWorkplaceType
);

router.get(
  "/job/workLocation/get",
  verifyToken,
  JobsController.getWorklocation
);

router.get(
  "/job/durationTypes/get",
  verifyToken,
  JobsController.getInternshipDuration
);

router.get("/getDuration", verifyToken, JobsController.getDurationPeriod);
router.get("/getBenefits", verifyToken, JobsController.getBenefits);
router.get("/getGender", verifyToken, JobsController.getGender);
router.get("/getEligibility", verifyToken, JobsController.getEligibility);
router.get("/getSalaryType", verifyToken, JobsController.getSalaryType);

// Job posting module start

router.get("/userAppliedJobs", userController.getUserAppliedJobs);
router.put(
  "/updateUserAppliedJobStatus",
  userController.updateUserAppliedJobStatus
);
router.get("/getUserJobPostStatus", userController.getUserJobPostStatus);
router.post("/jobPosting", verifyToken, JobsController.jobPosting);
router.post("/applyforjob", verifyToken, JobsController.applyForJob);
router.get(
  "/getJobAppliedCandidates",
  verifyToken,
  JobsController.getJobAppliedCandidates
);
router.get(
  "/getAllAppliedCandidates",
  verifyToken,
  JobsController.getAllAppliedCandidates
);
router.get(
  "/getJobPostByUserId",
  verifyToken,
  JobsController.getJobPostByUserId
);
router.post("/getJobPosts", JobsController.getJobPosts);
router.put("/registrationClose", verifyToken, JobsController.registrationClose);

// Job posting module end

router.get("/getYears", JobsController.getYears);
router.get("/getSkills", JobsController.getSkills);
router.get("/getJobCategories", JobsController.getJobCategories);

// Email verification
router.post("/sendOTP", EmailController.sendVerificationEmail);
router.post("/verifyOTP", EmailController.verifyOTP);
router.put("/forgotPassword", userController.forgotPassword);
router.post("/insertProfile", userController.insertProfile);
router.get("/getExperienceRange", JobsController.getExperienceRange);
router.put("/updateSocialLinks", verifyToken, userController.updateSocialLinks);
router.post("/insertProjects", verifyToken, JobsController.insertProjects);
router.put("/updateProject", verifyToken, JobsController.updateProject);
router.post("/VerifyEmail", EmailController.VerifyEmail);
router.post("/competitionRegistration", EmailController.sendCompetitionRegistration);
router.post("/mentorQuery", EmailController.sendMentorQuery);
router.put("/updateResume", verifyToken, JobsController.updateResume);
router.put("/updateSkills", verifyToken, JobsController.updateSkills);
router.put("/updateAbout", verifyToken, JobsController.updateAbout);
router.get("/getUserType", userController.getUserType);

router.get("/getClasses", JobsController.getClasses);
router.put(
  "/updateBasicDetails",
  verifyToken,
  userController.updateBasicDetails
);

router.put("/updateEducation", verifyToken, userController.updateEducation);
router.delete("/deleteEducation", verifyToken, userController.deleteEducation);
router.post("/insertEducation", verifyToken, userController.insertEducation);

router.put("/updateExperience", verifyToken, JobsController.updateExperience);
router.post("/insertExperience", verifyToken, JobsController.insertExperience);
router.delete(
  "/deleteExperience",
  verifyToken,
  JobsController.deleteExperience
);
router.get("/getUserProfile", verifyToken, userController.getUserProfile);
router.get("/getQualification", JobsController.getQualification);
router.get("/getCourses", JobsController.getCourses);
router.get("/getSpecialization", JobsController.getSpecialization);
router.get("/getColleges", JobsController.getColleges);
router.get("/getCourseType", JobsController.getCourseType);

// router.post("/insertCollege", RoleController.insertCollege);

router.delete("/deleteProject", verifyToken, JobsController.deleteProject);
router.post("/saveJobPost", verifyToken, JobsController.saveJobPost);
router.get("/getSavedJobs", verifyToken, JobsController.getSavedJobs);
router.delete("/removeSavedJobs", verifyToken, JobsController.removeSavedJobs);
router.get("/isProfileUpdated", verifyToken, userController.isProfileUpdated);

router.get("/checkIsJobApplied", verifyToken, JobsController.checkIsJobApplied);
router.get("/checkIsJobSaved", verifyToken, JobsController.checkIsJobSaved);
router.put(
  "/updateProfileImage",
  verifyToken,
  userController.updateProfileImage
);

router.put(
  "/updateBanner",
  verifyToken,
  userController.updateBanner
);

router.put(
  "/updateJobDescription",
  verifyToken,
  JobsController.updateJobDescription
);
router.put("/updateEligibility", verifyToken, JobsController.updateEligibility);

router.get("/searchByKeyword", JobsController.searchByKeyword);
router.put("/updateJobNature", verifyToken, JobsController.updateJobNature);
router.put(
  "/updateJobBasicDetails",
  verifyToken,
  JobsController.updateJobBasicDetails
);
router.post("/dailyStreak", LoginController.dailyStreak);
router.get("/getDailyStreak", LoginController.getDailyStreak);
router.put("/changePassword", verifyToken, LoginController.changePassword);
router.get("/getAppliedCandidatesCount", verifyToken, JobsController.getAppliedCandidatesCount);
router.get("/getHomePageStats", JobsController.getHomePageStats);
router.get("/getTrendingSearches", JobsController.getTrendingSearches);
router.get("/getUniqueCompanies", JobsController.getUniqueCompanies);
router.get("/superadmin/dashboard-stats", verifyToken, JobsController.getSuperAdminDashboardData);
router.get("/StatsOfPost", verifyToken, JobsController.StatsOfPost);
router.get("/getLocations", JobsController.getLocations);
router.get(
  "/getAllCandidateByRecruiter",
  verifyToken,
  JobsController.getAllCandidateByRecruiter
);

router.post(
  "/sendAppliedNotification",
  NotificationController.sendAppliedNotification
);
router.post("/subscribe-topic", NotificationController.subscribeToTopic);
router.post(
  "/broadcast-notification",
  NotificationController.sendTopicNotification
);

router.post("/applyJob", applyJob);

// Token management routes
router.use("/token", tokenRoutes);
router.use("/blogs", blogRoutes);

// group auth under /api/auth
router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/event-registration", eventRegistrationRoutes);
router.use("/workshops", workshopRoutes);
router.use("/workshop-registration", workshopRegistrationRoutes);
router.use("/courses", courseRoutes)

module.exports = router;
