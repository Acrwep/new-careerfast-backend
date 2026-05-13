const pool = require("../config/dbConfig");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const JobsModel = {
  insertJobNature: async (nature_name) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id FROM job_nature WHERE name = ? AND is_active = 1`,
        nature_name
      );
      if (isExists.length > 0) throw new Error("Job nature is already exists");
      const [result] = await pool.query(
        `INSERT INTO job_nature(name) VALUES(?)`,
        nature_name
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getJobNature: async () => {
    try {
      const [natures] = await pool.query(
        `SELECT id, name FROM job_nature WHERE is_active = 1 ORDER BY id`
      );

      return natures;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertWorkPlaceType: async (workplace) => {
    try {
      const [isExists] = await pool.query(
        `SELECT id FROM workplace_type WHERE name = ? AND is_active = 1`,
        workplace
      );
      if (isExists.length > 0) throw new Error("Workplace is already exists");
      const [result] = await pool.query(
        `INSERT INTO workplace_type(name) VALUES(?)`,
        workplace
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getWorkplaceType: async () => {
    try {
      const [natures] = await pool.query(
        `SELECT id, name FROM workplace_type WHERE is_active = 1 ORDER BY id`
      );

      return natures;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getWorklocation: async () => {
    try {
      const [locations] = await pool.query(
        `SELECT id, name FROM work_location WHERE is_active = 1 ORDER BY id`
      );

      return locations;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getInternshipDuration: async () => {
    try {
      const [durationTypes] = await pool.query(
        `SELECT id, name FROM internship_duration WHERE is_active = 1 ORDER BY id`
      );

      return durationTypes;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getDurationPeriod: async (duration_type_id) => {
    try {

      const [durationPeriod] = await pool.query(
        `SELECT id, duration_type_id, duration FROM duration_period WHERE duration_type_id = ? AND is_active = 1 ORDER BY id`,
        [duration_type_id]
      );

      return durationPeriod;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getBenefits: async () => {
    try {
      const [benefits] = await pool.query(
        `SELECT id, name, logo FROM benefits WHERE is_active = 1 ORDER BY id`
      );

      return benefits;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getGender: async () => {
    try {
      const [genders] = await pool.query(
        `SELECT id, name FROM gender WHERE is_active = 1 ORDER BY id`
      );

      return genders;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getEligibility: async () => {
    try {
      const [eligibility] = await pool.query(
        `SELECT id, name FROM eligibility_type WHERE is_active = 1 ORDER BY id`
      );

      return eligibility;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getSalaryType: async () => {
    try {
      const [salaryType] = await pool.query(
        `SELECT id, name FROM salary_type WHERE is_active = 1 ORDER BY id`
      );

      return salaryType;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  jobPosting: async (
    user_id,
    company_name,
    company_logo,
    job_title,
    job_nature,
    duration_period,
    workplace_type,
    work_location,
    job_category,
    skills,
    experience_type,
    experience_required,
    salary_type,
    currency,
    min_salary,
    max_salary,
    diversity_hiring,
    benefits,
    job_description,
    seo_description,
    openings,
    working_days,
    questions,
    salary_duration
  ) => {
    try {
      const query = `
      INSERT INTO job_post (
        user_id,
        company_name,
        company_logo,
        job_title,
        job_nature,
        duration_period,
        workplace_type,
        work_location,
        job_category,
        skills,
        experience_type,
        experience_required,
        salary_type,
        currency,
        min_salary,
        max_salary,
        diversity_hiring,
        benefits,
        job_description,
        seo_description,
        openings,
        working_days,
        salary_duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const values = [
        user_id,
        company_name,
        company_logo,
        job_title,
        job_nature,
        JSON.stringify(duration_period),
        workplace_type,
        JSON.stringify(work_location),
        JSON.stringify(job_category),
        JSON.stringify(skills),
        experience_type,
        JSON.stringify(experience_required),
        salary_type,
        currency,
        min_salary,
        max_salary,
        JSON.stringify(diversity_hiring),
        JSON.stringify(benefits),
        job_description,
        seo_description,
        openings,
        working_days,
        salary_duration
        // ❌ removed created_at completely (MySQL will auto-fill)
      ];

      // Insert new categories into job_categories table if they don't exist
      if (job_category && job_category.length > 0) {
        for (const cat of job_category) {
          const [exists] = await pool.query(
            "SELECT id FROM job_categories WHERE category_name = ?",
            [cat]
          );
          if (exists.length === 0) {
            await pool.query(
              "INSERT INTO job_categories (category_name, is_active) VALUES (?, 1)",
              [cat]
            );
          }
        }
      }

      // Insert new skills into skills table if they don't exist
      if (skills && skills.length > 0) {
        for (const skill of skills) {
          const [exists] = await pool.query(
            "SELECT id FROM skills WHERE name = ?",
            [skill]
          );
          if (exists.length === 0) {
            await pool.query(
              "INSERT INTO skills (name) VALUES (?)",
              [skill]
            );
          }
        }
      }

      const [result] = await pool.query(query, values);

      const lastJobPostId = result.insertId;

      // Insert Questions
      if (questions && questions.length > 0) {
        for (const q of questions) {
          await pool.query(
            `INSERT INTO job_post_questions (post_id, question, isrequired)
           VALUES (?, ?, ?)`,
            [lastJobPostId, q.question, q.isrequired]
          );
        }
      }

      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },


  applyForJob: async (postId, userId, answers) => {
    try {
      const query = `INSERT INTO applied_jobs(postId, userId, created_at) VALUES (?, ?, NOW())`;
      const values = [postId, userId];

      const [result] = await pool.query(query, values);

      if (answers.length >= 1) {
        answers.map(async (item) => {
          const query = `INSERT INTO job_post_answers (postId, userId, questionId, answer, created_at) VALUES (?,?,?,?, NOW())`;
          const values = [postId, userId, item.questionId, item.answer];
          await pool.query(query, values);
        });
      }
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getJobAppliedCandidates: async (post_id) => {
    const query = `
    SELECT 
      job_post.id AS postId,
      job_post.job_title,
      job_post.company_name,
      job_post.job_nature,
      job_post.duration_period,
      job_post.workplace_type,
      job_post.work_location,
      job_post.job_category,
      job_post.skills,
      job_post.experience_type,
      job_post.experience_required,
      job_post.salary_type,
      job_post.min_salary,
      job_post.max_salary,
      job_post.diversity_hiring,
      job_post.benefits,
      job_post.job_description,
      job_post.openings,
      job_post.working_days,
      job_post.created_at AS post_created_at,
      users.id AS user_id,
      users.first_name,
      users.last_name,
      users.email,
      users.phone_code,
      users.phone,
      users.profile_image,
      applied_jobs.id as applied_jobs_id
    FROM job_post
    LEFT JOIN applied_jobs ON applied_jobs.postId = job_post.id
    LEFT JOIN users ON users.id = applied_jobs.userId
    WHERE job_post.id = ?
  `;

    const values = [post_id];

    try {
      const [rows] = await pool.query(query, values);

      if (rows.length === 0) return null;

      const post_questions_query = `SELECT * FROM job_post_questions WHERE post_id= ?`;
      const post_questions_values = [post_id];

      const [post_questions] = await pool.query(
        post_questions_query,
        post_questions_values
      );

      const post_answers_query = `SELECT * FROM job_post_answers WHERE postId= ?`;
      const post_answers_values = [post_id];

      const [post_answers] = await pool.query(
        post_answers_query,
        post_answers_values
      );

      const filterQuestionAnswerList = post_questions.flatMap((q) => {
        return post_answers
          .filter((a) => a.questionId === q.id)
          .map((a) => ({
            question: q.question,
            answer: a.answer,
            user_id: a.userId,
          }));
      });

      const now = dayjs().tz("Asia/Kolkata");

      const postData = rows.map((item) => {
        return {
          ...item,
          date_posted: dayjs(item.created_at).local().from(now),
          duration_period: JSON.parse(item.duration_period),
          work_location: JSON.parse(item.work_location),
          skills: JSON.parse(item.skills),
          experience_required: JSON.parse(item.experience_required),
          diversity_hiring: JSON.parse(item.diversity_hiring),
          job_category: JSON.parse(item.job_category),
          benefits: JSON.parse(item.benefits),
          users: rows
            .filter((row) => row.user_id)
            .map((row) => ({
              id: row.user_id,
              first_name: row.first_name,
              last_name: row.last_name,
              email: row.email,
              phone: row.phone,
              image: row.profile_image,
              applied_jobs_id: row.applied_jobs_id,
              candidateAnswersForRecruiterQuestions:
                filterQuestionAnswerList.filter(
                  (f) => f.user_id === row.user_id
                ),
            })),
        };
      });
      return postData;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getJobPostByUserId: async (user_id, limit, page, job_nature, search) => {
    try {
      // Build WHERE clause based on filters
      let whereClause = 'WHERE user_id = ?';
      let countValues = [user_id];
      let queryValues = [user_id];

      // Add job_nature filter if provided
      if (job_nature) {
        whereClause += ' AND job_nature = ?';
        countValues.push(job_nature);
        queryValues.push(job_nature);
      }

      // Add search filter if provided
      if (search) {
        whereClause += ' AND (job_title LIKE ? OR company_name LIKE ?)';
        const searchTerm = `%${search}%`;
        countValues.push(searchTerm, searchTerm);
        queryValues.push(searchTerm, searchTerm);
      }

      // Get total count with filters
      const countQuery = `SELECT COUNT(*) as total FROM job_post ${whereClause}`;
      const [countResult] = await pool.query(countQuery, countValues);
      const total = countResult[0]?.total || 0;

      // Build the main query
      let query = `
  SELECT 
    *, 
    CASE 
      WHEN job_post.is_closed = 1 THEN 1 
      ELSE 0 
    END AS is_closed 
  FROM job_post 
  ${whereClause}
  ORDER BY created_at DESC`;

      // ✅ Add LIMIT and OFFSET for pagination
      if (limit && !isNaN(limit)) {
        const limitValue = parseInt(limit, 10);
        const pageValue = page && !isNaN(page) ? parseInt(page, 10) : 1;
        const offset = (pageValue - 1) * limitValue;

        query += ` LIMIT ? OFFSET ?`;
        queryValues.push(limitValue, offset);
      }

      const [result] = await pool.query(query, queryValues);
      const now = dayjs().tz("Asia/Kolkata");
      const safeParse = (value) => {
        try { return JSON.parse(value); }
        catch { return Array.isArray(value) ? value : [value]; }
      };

      const formatResult = result.map((item) => {
        return {
          ...item,
          date_posted: dayjs(item.created_at).local().from(now),
          duration_period: safeParse(item.duration_period),
          work_location: safeParse(item.work_location),
          skills: safeParse(item.skills),
          experience_required: safeParse(item.experience_required),
          diversity_hiring: safeParse(item.diversity_hiring),
          job_category: safeParse(item.job_category),
          benefits: safeParse(item.benefits),
        };
      });

      return {
        data: formatResult,
        total: total,
        page: page || 1,
        limit: limit || total
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getYears: async () => {
    try {
      const [years] = await pool.query(
        `SELECT id, year FROM year_master ORDER BY id`
      );

      return years;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getSkills: async () => {
    try {
      const [skills] = await pool.query(
        `SELECT
            id,
            name
        FROM
            skills
        ORDER BY CASE WHEN name
            = 'Others' THEN 1 ELSE 0
        END,
        name`
      );
      return skills;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getJobCategories: async (filters = {}) => {
    try {
      let query;
      let values = [];

      if (Object.keys(filters).length > 0) {
        let whereClauses = ["c.is_active = 1"];
        
        if (filters.job_nature) {
          whereClauses.push("j.job_nature = ?");
          values.push(filters.job_nature);
        }
        
        if (filters.experience_type) {
          whereClauses.push("j.experience_type = ?");
          values.push(filters.experience_type);
        }

        query = `
          SELECT DISTINCT c.id, c.category_name 
          FROM job_categories c
          JOIN job_post j ON JSON_CONTAINS(j.job_category, JSON_QUOTE(c.category_name))
          WHERE ${whereClauses.join(" AND ")}
          ORDER BY CASE WHEN c.category_name = 'Others' THEN 1 ELSE 0 END, c.category_name
        `;
      } else {
        query = `
          SELECT id, category_name 
          FROM job_categories 
          WHERE is_active = 1 
          ORDER BY CASE WHEN category_name = 'Others' THEN 1 ELSE 0 END, category_name
        `;
      }

      const [categories] = await pool.query(query, values);
      return categories;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getJobPosts: async (filters = {}) => {
    try {
      let query = `SELECT
                      id,
                      company_name,
                      company_logo,
                      job_title,
                      job_nature,
                      duration_period,
                      workplace_type,
                      work_location,
                      job_category,
                      skills,
                      experience_type,
                      experience_required,
                      salary_type,
                      currency,
                      min_salary,
                      max_salary,
                      diversity_hiring,
                      benefits,
                      openings,
                      working_days,
                      salary_duration,
                      created_at
                  FROM
                      job_post`;

      const whereClauses = [];
      const queryParams = [];

      // ID filter
      if (filters.id) {
        whereClauses.push(`id = ?`);
        queryParams.push(filters.id);
      }

      // Workplace type filter - fixed
      if (filters.workplace_type && filters.workplace_type.length > 0) {
        const placeholders = filters.workplace_type.map(() => "?").join(",");
        whereClauses.push(`workplace_type IN (${placeholders})`);
        queryParams.push(...filters.workplace_type);
      }

      // Status filter
      if (filters.status) {
        const daysThreshold = filters.days || 15; // Default to 15 if `filters.days` is undefined

        if (filters.status === "Live") {
          whereClauses.push(
            `DATEDIFF(NOW(), created_at) BETWEEN -${daysThreshold} AND ${daysThreshold}`
          );
        } else if (filters.status === "Expired") {
          whereClauses.push(
            `DATEDIFF(NOW(), created_at) < -${daysThreshold} OR DATEDIFF(NOW(), created_at) > ${daysThreshold}`
          );
        }
      }

      // job nature filter
      if (filters.job_nature) {
        whereClauses.push(`LOWER(job_nature) = LOWER(?)`);
        queryParams.push(filters.job_nature);
      }

      // experience type filter
      if (filters.experience_type) {
        whereClauses.push(`LOWER(experience_type) = LOWER(?)`);
        queryParams.push(filters.experience_type);
      }

      // Company filter
      if (filters.companies && filters.companies.length > 0) {
        const placeholders = filters.companies.map(() => "LOWER(?)").join(",");
        whereClauses.push(`LOWER(company_name) IN (${placeholders})`);
        queryParams.push(...filters.companies.map(c => c.toLowerCase()));
      }

      // Workplace location filter
      if (filters.work_location) {
        let workLocations = Array.isArray(filters.work_location)
          ? filters.work_location
          : [filters.work_location];
        
        // Filter out any empty/null values
        workLocations = workLocations.filter(loc => loc && String(loc).trim() !== "");

        if (workLocations.length > 0) {
          whereClauses.push(`(
            ${workLocations
              .map(() => `JSON_SEARCH(LOWER(IF(JSON_VALID(work_location), work_location, '[]')), 'one', ?) IS NOT NULL`)
              .join(" OR ")}
          )`);

          workLocations.forEach((loc) => {
            queryParams.push(loc.toLowerCase());
          });
        }
      }

      // Working days filter
      if (filters.working_days) {
        whereClauses.push(`working_days = ?`);
        queryParams.push(filters.working_days);
      }

      // Date range filter
      if (filters.start_date && filters.end_date) {
        whereClauses.push(`DATE(created_at) BETWEEN ? AND ?`);
        queryParams.push(filters.start_date, filters.end_date);
      } else if (filters.start_date) {
        whereClauses.push(`DATE(created_at) >= ?`);
        queryParams.push(filters.start_date);
      } else if (filters.end_date) {
        whereClauses.push(`DATE(created_at) <= ?`);
        queryParams.push(filters.end_date);
      }

      // Job category filter (array of categories)
      // In your model where you build the query:
      if (filters.job_categories && filters.job_categories.length > 0) {
        const validCategories = filters.job_categories.filter(cat => cat && String(cat).trim() !== "");
        
        if (validCategories.length > 0) {
          whereClauses.push(`(
            ${validCategories
              .map(() => `JSON_SEARCH(LOWER(IF(JSON_VALID(job_category), job_category, '[]')), 'one', ?) IS NOT NULL`)
              .join(" OR ")}
          )`);

          validCategories.forEach((category) => {
            queryParams.push(category.toLowerCase());
          });
        }
      }

      // Search term filter (searches in job_title and company_name)
      if (filters.searchTerm) {
        const searchTerm = `%${filters.searchTerm.toLowerCase()}%`;
        whereClauses.push(`(LOWER(job_title) LIKE ? OR LOWER(company_name) LIKE ?)`);
        queryParams.push(searchTerm, searchTerm);
      }

      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(" AND ")}`;
      }

      // Get total count before applying pagination
      const countQuery = `SELECT COUNT(*) as total FROM job_post${whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : ''}`;
      const [countResult] = await pool.query(countQuery, queryParams);
      const totalCount = countResult[0]?.total || 0;

      // Salary sorting
      if (filters.salary_sort) {
        if (filters.salary_sort === "low_to_high") {
          query += ` ORDER BY COALESCE(min_salary, 0) ASC`;
        } else if (filters.salary_sort === "high_to_low") {
          query += ` ORDER BY COALESCE(max_salary, 0) DESC`;
        }
      } else {
        query += ` ORDER BY created_at DESC`;
      }

      // Apply pagination with LIMIT and OFFSET
      const limit = filters.limit || 20;
      const page = filters.page || 1;
      const offset = (page - 1) * limit;

      query += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      const [posts] = await pool.query(query, queryParams);

      // Helper function to safely parse JSON arrays
      const safeParseArray = (str) => {
        try {
          return str ? JSON.parse(str) : [];
        } catch (e) {
          return [];
        }
      };

      const questionQuery = `SELECT id, post_id, question, CASE WHEN isrequired = 1 THEN 1 ELSE 0 END AS isrequired FROM job_post_questions WHERE post_id = ? ORDER BY created_at ASC`;

      const now = dayjs().tz("Asia/Kolkata");

      const processedPosts = await Promise.all(
        posts.map(async (post) => {
          const [questions] = await pool.query(questionQuery, [post.id]);

          return {
            ...post,
            date_posted: dayjs(post.created_at).tz("Asia/Kolkata").from(now),
            duration_period: safeParseArray(post.duration_period),
            work_location: safeParseArray(post.work_location),
            job_category: safeParseArray(post.job_category),
            skills: safeParseArray(post.skills),
            experience_required: safeParseArray(post.experience_required),
            diversity_hiring: safeParseArray(post.diversity_hiring),
            benefits: safeParseArray(post.benefits),
            working_days: post.working_days || null,
            questions,
          };
        })
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        message: "Job posts fetched successfully",
        data: processedPosts,
        meta: {
          total: totalCount,
          page: page,
          limit: limit,
          totalPages: totalPages,
          hasMore: page < totalPages,
          filters: filters,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  registrationClose: async (id) => {
    try {
      const [is_exists] = await pool.query(
        `SELECT id FROM job_post WHERE id = ? AND is_closed = 0`,
        id
      );
      if (is_exists.length == 0) {
        throw new Error("Invalid id");
      }

      const [result] = await pool.query(
        `UPDATE job_post SET is_closed = 1 WHERE id = ?`,
        id
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getExperienceRange: async () => {
    try {
      const [range] = await pool.query(
        `SELECT id, display_text, sort_order FROM experience_range WHERE is_active = 1 ORDER BY sort_order`
      );
      return range;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertProjects: async (
    user_id,
    company_name,
    project_title,
    project_type,
    start_date,
    end_date,
    description
  ) => {
    try {
      const projectQuery = `INSERT INTO user_projects(
                                    user_id,
                                    company_name,
                                    project_title,
                                    project_type,
                                    start_date,
                                    end_date,
                                    description
                                ) VALUES(?, ?, ?, ?, ?, ?, ?)`;
      const projectValue = [
        user_id,
        company_name,
        project_title,
        project_type,
        start_date,
        end_date,
        description,
      ];

      await pool.query(projectQuery, projectValue);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateProject: async (
    company_name,
    project_title,
    project_type,
    start_date,
    end_date,
    description,
    id
  ) => {
    try {
      const [chechId] = await pool.query(
        `SELECT id FROM user_projects WHERE id = ?`,
        [id]
      );
      if (chechId.length === 0) {
        throw new Error("Invalid Id");
      }

      const updateQuery = `UPDATE user_projects SET
                              company_name = ?,
                              project_title = ?,
                              project_type = ?,
                              start_date = ?,
                              end_date = ?,
                              description = ?
                          WHERE id = ?`;
      const [result] = await pool.query(updateQuery, [
        company_name,
        project_title,
        project_type,
        start_date,
        end_date,
        description,
        id,
      ]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateResume: async (resumeBase64, id) => {
    try {
      const [updateResume] = await pool.query(
        `UPDATE users SET resume = ? WHERE id = ?`,
        [resumeBase64, id]
      );
      return updateResume.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateSkills: async (skills, user_id) => {
    try {
      const [skill] = await pool.query(
        `UPDATE users SET skills = ? WHERE id = ?`,
        [JSON.stringify(skills), user_id]
      );
      return skill.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateAbout: async (about, user_id) => {
    try {
      const [result] = await pool.query(
        `UPDATE users SET about = ? WHERE id = ?`,
        [about, user_id]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getClasses: async () => {
    try {
      const classes = [];
      for (let i = 1; i <= 12; i++) {
        classes.push(i);
      }
      return classes;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateExperience: async (
    job_title,
    company_name,
    designation,
    start_date,
    end_date,
    currently_working,
    skills,
    id,
    user_id
  ) => {
    try {
      const [chechId] = await pool.query(
        `SELECT id FROM user_professional WHERE id = ?`,
        [id]
      );
      if (chechId.length <= 0) {
        throw new Error("Invalid Id");
      }
      const updateQuery = `UPDATE user_professional SET
                              job_title = ?,
                              company_name = ?,
                              designation = ?,
                              start_date = ?,
                              end_date = ?,
                              currently_working = ?,
                              skills = ?
                          WHERE id = ? AND user_id = ?`;
      const values = [
        job_title,
        company_name,
        designation,
        start_date,
        end_date,
        currently_working,
        JSON.stringify(skills),
        id,
        user_id,
      ];
      const [result] = await pool.query(updateQuery, values);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  insertExperience: async (user_id, experiences) => {
    try {
      const insertedIds = [];
      if (experiences.length >= 1) {
        for (const e of experiences) {
          const insertQuery = `INSERT INTO user_professional(
                              user_id,
                              job_title,
                              company_name,
                              designation,
                              start_date,
                              end_date,
                              currently_working,
                              skills
                          )
                          VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
          const values = [
            user_id,
            e.job_title,
            e.company_name,
            e.designation,
            e.start_date,
            e.end_date,
            e.currently_working,
            JSON.stringify(e.skills || []),
          ];
          const [result] = await pool.query(insertQuery, values);
          insertedIds.push(result.insertId);
        }
      }
      return insertedIds;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteExperience: async (id) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM user_professional WHERE id = ?`,
        id
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getQualification: async () => {
    try {
      const [qualifications] = await pool.query(
        `SELECT id, name FROM qualification WHERE is_deleted = 0`
      );
      return qualifications;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCourses: async () => {
    try {
      const [courses] = await pool.query(
        `SELECT id, name FROM course_master WHERE is_deleted = 0`
      );
      return courses;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getSpecialization: async () => {
    try {
      const [specializations] = await pool.query(
        `SELECT id, name FROM specialization_master WHERE is_deleted = 0`
      );
      return specializations;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getColleges: async () => {
    try {
      const [colleges] = await pool.query(
        `SELECT id, name, city, state, university FROM college_master WHERE is_deleted = 0`
      );
      return colleges;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getCourseType: async () => {
    const types = ["Part-time", "Full-time", "Distance Learning"];
    return types;
  },

  deleteProject: async (id) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM user_projects WHERE id = ?`,
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  saveJobPost: async (user_id, job_post_id) => {
    try {
      const insertQuery = `INSERT INTO user_saved_jobs (user_id, job_post_id, created_date) VALUES (?, ?, ?)`;
      const values = [user_id, job_post_id, new Date()];
      const [result] = await pool.query(insertQuery, values);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getSavedJobs: async (user_id) => {
    try {
      const query = `SELECT
                        sj.id,
                        sj.user_id,
                        sj.job_post_id,
                        jp.company_name,
                        jp.company_logo,
                        jp.job_title,
                        sj.created_date,
                        jp.work_location,
                        jp.salary_type,
                        jp.min_salary,
                        jp.max_salary
                    FROM
                        user_saved_jobs sj
                    INNER JOIN job_post jp ON
                        sj.job_post_id = jp.id
                    WHERE
                        sj.user_id = ?
                    ORDER BY
                        sj.created_date`;
      const [savedJobs] = await pool.query(query, [user_id]);
      const now = dayjs().tz("Asia/Kolkata");
      // Modify the date format
      const formattedJobs = savedJobs.map((job) => {
        return {
          ...job,
          date_posted: dayjs(job.created_date).tz("Asia/Kolkata").from(now),
        };
      });
      return formattedJobs;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  removeSavedJobs: async (id) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM user_saved_jobs WHERE id = ?`,
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  checkIsJobApplied: async (user_id, job_post_id) => {
    try {
      const [isApplied] = await pool.query(
        `SELECT id FROM applied_jobs WHERE postId = ? AND userId = ?`,
        [job_post_id, user_id]
      );
      return isApplied.length > 0 ? true : false;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  checkIsJobSaved: async (user_id, job_post_id) => {
    try {
      const [isSaved] = await pool.query(
        `SELECT id FROM user_saved_jobs WHERE user_id = ? AND job_post_id = ?`,
        [user_id, job_post_id]
      );
      return isSaved.length > 0 ? true : false;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateJobDescription: async (job_post_id, description, benefits) => {
    try {
      const [isIdExists] = await pool.query(
        `SELECT id FROM job_post WHERE id = ?`,
        [job_post_id]
      );
      if (isIdExists.length <= 0) {
        throw new Error("Invalid Id");
      }
      const [result] = await pool.query(
        `UPDATE job_post SET job_description = ?, benefits = ? WHERE id = ?`,
        [description, JSON.stringify(benefits), job_post_id]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateEligibility: async (
    job_post_id,
    experience_type,
    experience_required,
    salary_type,
    min_salary,
    max_salary,
    diversity_hiring,
    currency,
    salary_duration
  ) => {
    try {
      const [isIdExists] = await pool.query(
        `SELECT id FROM job_post WHERE id = ?`,
        [job_post_id]
      );
      if (isIdExists.length <= 0) {
        throw new Error("Invalid Id");
      }
      const [result] = await pool.query(
        `UPDATE job_post SET experience_type = ?, experience_required = ?, salary_type = ?, min_salary = ?, max_salary = ?, diversity_hiring = ?, currency = ?, salary_duration = ? WHERE id = ?`,
        [
          experience_type,
          JSON.stringify(experience_required),
          salary_type,
          min_salary,
          max_salary,
          JSON.stringify(diversity_hiring),
          currency,
          salary_duration,
          job_post_id,
        ]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateJobNature: async (
    job_post_id,
    job_nature,
    duration_period,
    workplace_type,
    work_location
  ) => {
    try {
      const [isIdExists] = await pool.query(
        `SELECT id FROM job_post WHERE id = ?`,
        [job_post_id]
      );
      if (isIdExists.length <= 0) {
        throw new Error("Invalid Id");
      }
      const [result] = await pool.query(
        `UPDATE job_post SET job_nature = ?, duration_period = ?, workplace_type = ?, work_location = ? WHERE id = ?`,
        [
          job_nature,
          JSON.stringify(duration_period),
          workplace_type,
          JSON.stringify(work_location),
          job_post_id,
        ]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateJobBasicDetails: async (
    job_post_id,
    company_name,
    company_logo,
    job_title,
    job_categories,
    skills,
    openings,
    working_days
  ) => {
    try {
      const [isIdExists] = await pool.query(
        `SELECT id FROM job_post WHERE id = ?`,
        [job_post_id]
      );
      if (isIdExists.length <= 0) {
        throw new Error("Invalid Id");
      }

      const updateQuery = `UPDATE job_post SET company_name = ?, company_logo = ?, job_title = ?, job_category = ?, skills = ?, openings = ?, working_days = ? WHERE id = ?`;
      const values = [
        company_name,
        company_logo,
        job_title,
        JSON.stringify(job_categories),
        JSON.stringify(skills),
        openings,
        working_days,
        job_post_id,
      ];
      const [result] = await pool.query(updateQuery, values);
      return result.affectedRows;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  searchByKeyword: async (searchTerm, category) => {
    try {
      if (category === "Courses") {
        let sql = "SELECT id, title as job_title, description as job_description, image as company_logo, 'Course' as job_nature, slug FROM courses";
        let params = [];

        if (searchTerm) {
          sql += " WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?";
          const term = `%${searchTerm.toLowerCase()}%`;
          params = [term, term, term];
        }

        const [rows] = await pool.query(sql, params);
        return rows.map(row => ({
          ...row,
          company_name: "CareerFast Academy", // Default for courses if not specified
          id: row.id,
          job_title: row.job_title,
          company_logo: row.company_logo,
          job_nature: "Course",
          slug: row.slug
        }));
      }

      const filters = [];
      // Category filter for Jobs/Internships
      if (category && category !== "All") {
        if (category === "Internships") {
          filters.push(`LOWER(job_nature) = 'internship'`);
        } else if (category === "Jobs") {
          filters.push(`LOWER(job_nature) = 'job'`);
        }
      }

      // Keyword filter
      if (searchTerm) {
        const words = searchTerm
          .toLowerCase()
          .split(" ")
          .filter((word) => word.length > 0);

        words.forEach((word) => {
          const likeFields = [
            `LOWER(company_name) LIKE '%${word}%'`,
            `LOWER(job_title) LIKE '%${word}%'`,
            `LOWER(job_nature) LIKE '%${word}%'`,
            `LOWER(workplace_type) LIKE '%${word}%'`,
            `LOWER(work_location) LIKE '%${word}%'`,
            `JSON_SEARCH(LOWER(job_category), 'one', '%${word}%') IS NOT NULL`,
            `JSON_SEARCH(LOWER(skills), 'one', '%${word}%') IS NOT NULL`,
            `LOWER(experience_type) LIKE '%${word}%'`,
            `LOWER(salary_type) LIKE '%${word}%'`,
            `JSON_SEARCH(LOWER(diversity_hiring), 'one', '%${word}%') IS NOT NULL`,
            `JSON_SEARCH(LOWER(benefits), 'one', '%${word}%') IS NOT NULL`,
            `LOWER(job_description) LIKE '%${word}%'`,
          ];

          filters.push(`(${likeFields.join(" OR ")})`);
        });
      }

      const whereClause =
        filters.length > 0 ? "WHERE " + filters.join(" AND ") : "";

      const query = `SELECT
                        id,
                        user_id,
                        company_name,
                        company_logo,
                        job_title,
                        job_nature,
                        duration_period,
                        workplace_type,
                        work_location,
                        job_category,
                        skills,
                        experience_type,
                        experience_required,
                        salary_type,
                        min_salary,
                        max_salary,
                        diversity_hiring,
                        benefits,
                        openings,
                        working_days,
                        salary_duration,
                        created_at,
                        CASE WHEN is_closed = 1 THEN 1 ELSE 0 END AS is_closed
                    FROM
                        job_post
                    ${whereClause}`;
      const [result] = await pool.query(query);

      const now = dayjs().tz("Asia/Kolkata");

      // Convert string to array
      const getPosts = result.map((row) => {
        return {
          ...row,
          date_posted: dayjs(row.created_at).tz("Asia/Kolkata").from(now),
          duration_period: row.duration_period
            ? JSON.parse(row.duration_period)
            : [],
          job_category: row.job_category ? JSON.parse(row.job_category) : [],
          skills: row.skills ? JSON.parse(row.skills) : [],
          experience_required: row.experience_required
            ? JSON.parse(row.experience_required)
            : [],
          diversity_hiring: row.diversity_hiring
            ? JSON.parse(row.diversity_hiring)
            : [],
          benefits: row.benefits ? JSON.parse(row.benefits) : [],
        };
      });
      return getPosts;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAppliedCandidatesCount: async (user_id) => {
    try {
      const query = `SELECT
                        COUNT(*) AS total_candidates
                    FROM
                        job_post AS j
                    INNER JOIN applied_jobs AS aj ON        
                      j.id = aj.postId
                    WHERE
                        user_id = ?`;
      const [candidatesCount] = await pool.query(query, [user_id]);
      const getGenderQuery = `SELECT
                                  COUNT(CASE WHEN u.gender = 'Male' THEN 1 END) AS male_count,
                                  COUNT(CASE WHEN u.gender = 'Female' THEN 1 END) AS female_count,
                                  COUNT(CASE WHEN u.gender NOT IN ('Male', 'Female') OR u.gender IS NULL THEN 1 END) AS others_count
                              FROM
                                  job_post AS j
                              INNER JOIN applied_jobs AS aj ON
                                  j.id = aj.postId
                              INNER JOIN users AS u ON
                                  u.id = aj.userId
                              WHERE
                                  j.user_id = ?;`;
      const [getGenderStats] = await pool.query(getGenderQuery, [user_id]);

      const domainQuery = `SELECT
                              JSON_UNQUOTE(
                                  JSON_EXTRACT(j.job_category, '$[0]')
                              ) AS job_categories,
                              IFNULL(COUNT(aj.userId), 0) AS candidates_count
                          FROM
                              job_post AS j
                          INNER JOIN applied_jobs AS aj ON j.id = aj.postId
                          WHERE
                              j.user_id = ? GROUP BY job_categories`;
      const [getDomainStats] = await pool.query(domainQuery, [user_id]);
      return {
        candidatesCount: candidatesCount[0].total_candidates,
        males: getGenderStats[0].male_count,
        females: getGenderStats[0].female_count,
        others: getGenderStats[0].others_count,
        domain_stats: getDomainStats,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  StatsOfPost: async (user_id, job_post_id) => {
    try {
      const values = [user_id, job_post_id];
      const getquery = `SELECT
                        COUNT(*) AS total_candidates
                    FROM
                        job_post AS j
                    INNER JOIN applied_jobs AS aj
                    ON
                        j.id = aj.postId
                    WHERE
                        j.user_id = ? AND j.id = ?`;
      const [candidatesCount] = await pool.query(getquery, values);

      const getGenderQuery = `SELECT
                                  COUNT(CASE WHEN u.gender = 'Male' THEN 1 END) AS male_count,
                                  COUNT(CASE WHEN u.gender = 'Female' THEN 1 END) AS female_count,
                                  COUNT(CASE WHEN u.gender NOT IN ('Male', 'Female') OR u.gender IS NULL THEN 1 END) AS others_count
                              FROM
                                  job_post AS j
                              INNER JOIN applied_jobs AS aj ON
                                  j.id = aj.postId
                              INNER JOIN users AS u ON
                                  u.id = aj.userId
                              WHERE
                                  j.user_id = ? AND j.id = ?;`;
      const [getGenderStats] = await pool.query(getGenderQuery, values);
      return {
        candidatesCount: candidatesCount[0].total_candidates,
        males: getGenderStats[0].male_count,
        females: getGenderStats[0].female_count,
        others: getGenderStats[0].others_count,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllCandidateByRecruiter: async (user_id) => {
    try {
      const getquery = `SELECT
                            u.id AS user_id,
                            u.first_name,
                            u.last_name,
                            u.email,
                            u.phone_code,
                            u.profile_image,
                            u.phone,
                            j.id AS job_post_id,
                            j.job_title,
                            aj.created_at
                        FROM
                            job_post AS j
                        INNER JOIN applied_jobs AS aj ON
                          j.id = aj.postId
                        INNER JOIN users AS u ON
                          aj.userId = u.id
                        WHERE
                            j.user_id = ? ORDER BY j.created_at ASC`;
      const [candidates] = await pool.query(getquery, [user_id]);
      return candidates;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllAppliedCandidates: async () => {
    try {
      const query = `
        SELECT
            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            u.profile_image,
            j.id AS job_post_id,
            j.job_title,
            j.company_name,
            aj.id AS applied_jobs_id,
            aj.created_at
        FROM applied_jobs AS aj
        INNER JOIN job_post AS j ON j.id = aj.postId
        INNER JOIN users AS u ON u.id = aj.userId
        ORDER BY aj.created_at DESC
      `;
      const [candidates] = await pool.query(query);
      return candidates;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getHomePageStats: async () => {
    try {
      const [jobsCount] = await pool.query("SELECT COUNT(*) as total FROM job_post");
      const [recruitersCount] = await pool.query("SELECT COUNT(DISTINCT company_name) as total FROM job_post");
      const [applicationsCount] = await pool.query("SELECT COUNT(*) as total FROM applied_jobs");

      return {
        totalJobs: jobsCount[0].total,
        totalRecruiters: recruitersCount[0].total,
        totalApplications: applicationsCount[0].total
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getTrendingSearches: async () => {
    try {
      // Get all work locations for 'Job'
      const [jobPosts] = await pool.query(
        "SELECT work_location FROM job_post WHERE job_nature = 'Job' AND work_location IS NOT NULL"
      );
      
      const locationCounts = {};
      jobPosts.forEach(post => {
        try {
          const locations = typeof post.work_location === 'string' ? JSON.parse(post.work_location) : post.work_location;
          if (Array.isArray(locations)) {
            locations.forEach(loc => {
              if (loc) {
                locationCounts[loc] = (locationCounts[loc] || 0) + 1;
              }
            });
          }
        } catch (e) {
          // Ignore invalid JSON
        }
      });

      const trendingLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([location, count]) => ({ location, count }));

      // Get all categories for 'Internship'
      const [internshipPosts] = await pool.query(
        "SELECT job_category FROM job_post WHERE job_nature = 'Internship' AND job_category IS NOT NULL"
      );

      const categoryCounts = {};
      internshipPosts.forEach(post => {
        try {
          const categories = typeof post.job_category === 'string' ? JSON.parse(post.job_category) : post.job_category;
          if (Array.isArray(categories)) {
            categories.forEach(cat => {
              if (cat) {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
              }
            });
          }
        } catch (e) {
          // Ignore invalid JSON
        }
      });

      const trendingCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([category, count]) => ({ category, count }));

      const trending = [];
      
      trendingLocations.forEach(item => {
        trending.push({
          label: `jobs, ${item.location}`,
          count: item.count,
          isNew: true
        });
      });

      trendingCategories.forEach(item => {
        trending.push({
          label: `internship, ${item.category}`,
          count: item.count,
          isNew: true
        });
      });

      return trending;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUniqueCompanies: async () => {
    try {
      const [companies] = await pool.query(
        "SELECT DISTINCT company_name FROM job_post WHERE company_name IS NOT NULL AND company_name != '' ORDER BY company_name"
      );
      return companies.map(c => c.company_name);
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = JobsModel;
