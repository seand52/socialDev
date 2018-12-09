'use strict';
const { models: { User, Project, Meeting, Conversation } } = require('data')
const { AlreadyExistsError, AuthError, NotFoundError, ValueError } = require('../errors')
const validate = require('../utils/validate')
const cloudinary = require('cloudinary')
const { env: { CLOUD__NAME, API__KEY, API__SECRET } } = process
cloudinary.config({
    cloud_name: CLOUD__NAME,
    api_key: API__KEY,
    api_secret: API__SECRET
})

const logic = {

    _isAlreadyRegisteredEmail(email) {

        return User.findOne({ email }).lean()
    },
    /**
     * Register User
     * @param {string} name 
     * @param {string} email 
     * @param {string} username 
     * @param {string} password 
     * 
     */
    registerUser(name, email, username, password) {
        if (typeof name !== 'string') throw TypeError(`${name} is not a string`)
        if (typeof email !== 'string') throw TypeError(`${email} is not a string`)
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!name.trim()) throw new ValueError('name is empty or blank')
        if (!email.trim()) throw new ValueError('email is empty or blank')
        if (!username.trim()) throw new ValueError('username is empty or blank')
        if (!password.trim()) throw new ValueError('password is empty or blank')


        return (async () => {
            let user = await User.findOne({ username })
            let emailIsRegistered = await logic._isAlreadyRegisteredEmail(email)
            if(user) throw new AlreadyExistsError(`username ${username} already exists`)
            if (emailIsRegistered) throw new AlreadyExistsError(`email ${email} is already registered`)

            user = new User({ name, email, username, password })

            await user.save()
        })()
    },
    /**
     * Authenticate User
     * @param {string} username 
     * @param {string} password
     * @returns {Promise <string>}
     */
    authenticateUser(username, password) {
        if (typeof username !== 'string') throw TypeError(`${username} is not a string`)
        if (typeof password !== 'string') throw TypeError(`${password} is not a string`)

        if (!username.trim()) throw new ValueError('username is empty or blank')
        if (!password.trim()) throw new ValueError('password is empty or blank')

        return (async () => {
            const user = await User.findOne({ username })

            if (!user || user.password !== password) throw new AuthError('invalid username or password')

            return user.id
        })()
    },
    /**
     * Retrieve basic user information
     * @param {string} id 
     * @returns {Promise <object>}
     */
    retrieveUser(id) {

        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id, { '_id': 0, password: 0, joinDate: 0, bio: 0, githubProfile: 0, skills: 0, savedProjects: 0, city: 0, __v: 0 }).lean()

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            user.id = id

            return user

        })()
    },

    /**
     * Retrieve profile related information
     * @param {string} id 
     * @returns {Promise <object>}
     */
    retrieveProfileInfo(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id, { '_id': 0, password: 0, username: 0, __v: 0 }).lean()

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            user.id = id

            return user

        })()
    },

    /**
     * Update user Profile info
     * @param {string} id 
     * @param {string} bio 
     * @param {string} githubProfile 
     * @param {string} city 
     * @param {Array} skills 
     */
    updateProfile(id, bio, githubProfile, city, skills) {
        validate([
            { key: 'id', value: id, type: String },
            { key: 'bio', value: bio, type: String, optional: true },
            { key: 'githubProfile', value: githubProfile, type: String, optional: true },
            { key: 'city', value: city, type: String, optional: true },
            { key: 'skills', value: skills, type: Array, optional: true }
        ])


        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            bio != null && (user.bio = bio)
            githubProfile != null && (user.githubProfile = githubProfile)
            city != null && (user.city = city)
            skills != null && (user.skills = skills)

            await user.save()
        }
        )()

    },
    /**
     * Add a new project
     * @param {string}id 
     * @param {string}name 
     * @param {string}description 
     * @param {Array}skills 
     * @param {string}maxMembers 
     */
    addNewProject(id, name, description, skills, maxMembers, location) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof name !== 'string') throw TypeError(`${name} is not a string`)
        if (typeof description !== 'string') throw TypeError(`${description} is not a string`)
        if (!(skills instanceof Array)) throw TypeError(`${skill} is not an array`)
        if (typeof maxMembers !== 'string') throw TypeError(`${maxMembers} is not a string`)
        if (typeof location !== 'string') throw TypeError(`${location} is not a string`)

        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!name.trim()) throw new ValueError('name is empty or blank')
        if (!description.trim()) throw new ValueError('description is empty or blank')
        if (!maxMembers.trim()) throw new ValueError('maxMembers is empty or blank')
        if (!location.trim()) throw new ValueError('location is empty or blank')

        return (async () => {

            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const project = new Project({ name, description, skills, maxMembers, owner: user.id, location })

            await project.save()
        })()
    },
    /**
     * 
     * @param {string} userId 
      @param {string} projectId 
     */
    deleteProject(userId, projectId) {
        if (typeof userId !== 'string') throw TypeError(`${userId} is not a string`)
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')
        if (!userId.trim()) throw new ValueError('userId is empty or blank')


        return (async () => {

            const project = await Project.findById(projectId)

            if (project.owner.toString() !== userId) throw Error('only project owner can delete a project')

            await project.remove()

            await Meeting.deleteMany({ project: projectId })


        })()
    },

    /**
 * List projects that belong to user
 * @param {string}id 
 * @returns {Promise <Object>}
 */
    listOwnProjects(id) {

        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id).lean()

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            let projects = await Project.find({ owner: user._id }).lean()


            projects.forEach(project => {
                project.id = project._id.toString()

                delete project._id
                delete project.__v

                project.owner = project.owner.toString()

                return project
            })

            return projects

        })()
    },


    /**
     * List all projects where the user is a collaborator
     * @param {string} id 
     * @returns {Promise <Object>}
     */
    listCollaboratingProjects(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw new ValueError('id is empty or blank')

        return (async () => {
            const user = await User.findById(id).lean()

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            let projects = await Project.find({ collaborators: user._id }).lean()

            projects.forEach(project => {
                project.id = project._id.toString()

                delete project._id

                delete project.__v

                project.owner = project.owner.toString()

                return project
            })

            return projects

        })()
    },
    /**
     * Removes a collaborator from a project
     * @param {string} id 
     * @param {string} collabId 
     * @param {string} projectId 
     */
    removeCollaboratorFromProject(id, collabId, projectId) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof collabId !== 'string') throw TypeError(`${collabId} is not a string`)
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)


        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!collabId.trim()) throw new ValueError('collabId is empty or blank')
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')

        return (async () => {
            const project = await Project.findById(projectId)

            if (id !== project.owner.toString()) throw Error('not the owner of the project')

            const collaborator = await User.findById(collabId)

            await Project.updateOne({ _id: projectId }, { $pull: { collaborators: collaborator._id }, $inc: { currentMembers: -1 } })


        })()

    },

    /**
     * User can save a project 
     * @param {string} id 
     * @param {string} projectId 
     */
    saveProject(id, projectId) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)

        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')

        return (async () => {

            const project = await Project.findById(projectId)
            if (!project) throw new NotFoundError(`project with id ${projectId} not found`)
            await User.updateOne({ _id: id }, { $push: { savedProjects: project._id } })

        })()
    },

    /**
     * User can view their saved projects
     * @param {string} id 
     * @returns {Promise <Array>}
     */
    listSavedProjects(id) {

        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id).populate('savedProjects').lean().exec()

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            const savedProjects = user.savedProjects

            savedProjects.forEach(project => {

                project.id = project._id.toString()

                delete project._id

                delete project.__v

                project.owner = project.owner.toString()

                return project
            })

            return savedProjects


        })()
    },

    /**
     * Removes a saved project
     * @param {string} id 
     * @param {string} projectId 
     */
    removeSavedProject(id, projectId) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)

        return (async () => {
            const project = await Project.findById(projectId)
            if (!project) throw new NotFoundError(`project with id ${projectId} not found`)
            const user = await User.findById(id)
            if (!user) throw new NotFoundError(`user with id ${id} not found`)
            await User.updateOne({ _id: user._id }, { $pull: { savedProjects: project._id } })

        })()
    },
    /**
     * Retrieve the information of a project
     * @param {string} projectId 
     * @returns {Promise <Object>}
     */
    retrieveProjectInfo(projectId, userId) {
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')

        if (typeof userId !== 'string') throw TypeError(`${userId} is not a string`)
        if (!userId.trim()) throw new ValueError('projectId is empty or blank')

        return (async () => {

            const project = await Project.findById(projectId)
                .populate('owner')
                .populate({ path: 'owner', select: 'profileImage name email' })
                .populate('collaborators')
                .populate({ path: 'collaborators', select: 'name profileImage' })
                .populate('pendingCollaborators')
                .populate({ path: 'pendingCollaborators', select: 'name profileImage' })
                .lean()
                .exec()

            if (!project) throw new NotFoundError(`project with id ${projectId} not found`)

            project.id = project._id.toString()

            delete project._id

            delete project.__v

            project.owner.id = project.owner._id.toString()

            delete project.owner._id

            project.collaborators.forEach(collaborator => {

                collaborator.id = collaborator._id.toString()

                delete collaborator._id

                return collaborator
            })

            project.pendingCollaborators.forEach(collaborator => {

                collaborator.id = collaborator._id.toString()

                delete collaborator._id

                return collaborator
            })

            const user = await User.findById(userId)
            project.viewerSkills = user.skills
            project.viewerSavedProjects = user.savedProjects

            return project

        })()
    },

    /**
     * Allow user to request to be a collaborator in a project
     * @param {string} id 
     * @param {string} projectId 
     */
    requestCollaboration(id, projectId) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)

        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')

        return (async () => {

            const user = await User.findById(id)
            if (!user) throw new NotFoundError(`user with id ${id} not found`)
            const project = await Project.findById(projectId)
            if (!project) throw new NotFoundError(`user with id ${projectId} not found`)
            if (parseInt(project.maxMembers) === project.currentMembers) throw Error('project capacity is full')

            await Project.updateOne({ _id: projectId }, { $push: { pendingCollaborators: user._id } })

        })()
    },

    /**
     * User can cancel their collaborator request
     * @param {string} id 
     * @param {string} projectId 
     */
    cancelCollaborationRequest(id, projectId) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)

        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')

        return (async () => {

            const user = await User.findById(id)

            await Project.updateOne({ _id: projectId }, { $pull: { pendingCollaborators: user._id } })

        })()
    },

    /**
     * Allows the user to decide whether to accept or reject the collaborator
     * @param {string} id 
     * @param {string} collabId 
     * @param {string} projectId 
     * @param {string} decision 
     */
    handleCollaboration(id, collabId, projectId, decision) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)

        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')

        return (async () => {

            const project = await Project.findById(projectId)

            const collab = await User.findById(collabId)

            if (id !== project.owner.toString()) throw Error('not the owner of the project')

            if (decision === 'accept') {
                await Project.updateOne(
                    { _id: projectId },
                    {
                        $pull: { pendingCollaborators: collab.id },
                        $push: { collaborators: collab.id },
                        $inc: { currentMembers: 1 }
                    }
                )
                await User.updateOne(
                    { _id: collabId },
                    {
                        $pull: { savedProjects: projectId }
                    }
                )
            } else {

                await Project.updateOne(
                    { _id: projectId },
                    {
                        $pull: { pendingCollaborators: collab.id },
                    }
                )
            }


        })()
    },

    /**
     * 
     * @param {string} id 
     * @returns {Promise <Object>}
     */
    retrievePendingCollaboratorProjects(id) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id)

            const keepFields = {
                name: true,
                description: true,
                projectImage: true,
                skills: true,
                location: true
            }
            const projects = await Project.find({ owner: user.id, pendingCollaborators: { "$exists": true, $not: { $size: 0 } } }, keepFields).lean()

            projects.forEach(project => {

                project.id = project._id.toString()

                delete project._id

                return project
            })

            return projects


        })()

    },

    /**
     * Allows a user to leave a project
     * @param {string} id 
     * @param {string} projectId 
     */
    leaveProject(id, projectId) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)

        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')

        return (async () => {

            const user = await User.findById(id)

            if (!user) throw Error('user does not exist')

            await Project.updateOne(
                { _id: projectId },
                {
                    $pull: { collaborators: user.id },
                    $inc: { currentMembers: -1 }
                }
            )

            await Meeting.updateOne(
                { project: projectId },
                {
                    $pull: { attending: user.id }
                }
            )



        })()
    },


    /**
     * Users can add a meeting to their project
     * @param {string} id 
     * @param {string} projectId 
     * @param {string} date 
     * @param {string} location 
     */
    addMeeting(id, projectId, date, location, description) {

        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)
        if (typeof description !== 'string') throw TypeError(`${description} is not a string`)
        if (typeof location !== 'string') throw TypeError(`${location} is not a string`)

        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!location.trim()) throw new ValueError('location is empty or blank')
        if (!description.trim()) throw new ValueError('description is empty or blank')
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')

        if (new Date() > date) throw Error('cannot create a meeting in the past')

        return (async () => {
            const user = await User.findById(id)

            const project = await Project.findById(projectId)

            if (!project) throw new NotFoundError(`project with id ${projectId} not found`)

            if (project.owner.toString() !== id) throw new Error(`not the owner of the project`)

            const meeting = new Meeting({ project: project.id, date, location, attending: [user._id], description: description })

            await meeting.save()

        })()
    },
    /**
     * Delete a meeting from a project 
     * @param {string} meetingId 
     */
    deleteMeeting(meetingId, userId) {
        if (typeof userId !== 'string') throw TypeError(`${userId} is not a string`)

        if (!userId.trim()) throw new ValueError('userId is empty or blank')

        if (typeof meetingId !== 'string') throw TypeError(`${meetingId} is not a string`)

        if (!meetingId.trim()) throw new ValueError('meetingId is empty or blank')

        return (async () => {

            const meeting = await Meeting.findById(meetingId)

            if (!meeting) throw new NotFoundError(`meeting with id ${meetingId} not found`)

            const project = await Project.findById(meeting.project)

            if (project.owner.toString() !== userId) throw new Error('not the owner of the project')

            await meeting.remove()

        })()
    },

    /**
     * Lists all the meetings that belong to a project
     * @param {string} projectId 
     * @returns {Promise <Object>}
     */
    listProjectMeetings(projectId) {

        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)
        if (!projectId.trim()) throw new ValueError('projectId is empty or blank')


        return (async () => {

            const meetings = await Meeting.find({ project: projectId }).lean().exec()

            meetings.forEach(meeting => {
                if (meeting._id) {
                    meeting.id = meeting._id.toString()

                    delete meeting._id

                    delete meeting.__v
                }

                meeting.attending.forEach(id => {
                    return id.toString()

                })

                return meeting
            })

            return meetings

        })()
    },

    /**
     * Retrieves additional information of a specific meeting
     * @param {string} meetingId 
     * @returns {Promise <Object>}
     */
    retrieveMeetingInfo(meetingId) {
        if (typeof meetingId !== 'string') throw TypeError(`${meetingId} is not a string`)
        if (!meetingId.trim()) throw new ValueError('meetingId is empty or blank')

        return (async () => {
            const meeting = await Meeting.findById(meetingId).populate('attending').lean().exec()

            meeting.attending.forEach(attendee => {

                attendee.id = attendee._id.toString()

                delete attendee._id

                delete attendee.__v

                return attendee

            })

            return meeting
        })()
    },

    /**
     * Add a user to a meeting
     * @param {string} id 
     * @param {string} meetingId 
     */
    attendMeeting(id, meetingId) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof meetingId !== 'string') throw TypeError(`${meetingId} is not a string`)

        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!meetingId.trim()) throw new ValueError('meetingId is empty or blank')

        return (async () => {

            const user = await User.findById(id)

            await Meeting.updateOne({ _id: meetingId }, { $push: { attending: user.id } })


        })()
    },

    /**
     * Delete a user from a meeting
     * @param {string} id 
     * @param {string} meetingId 

     */
    unAttendMeeting(id, meetingId) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (typeof meetingId !== 'string') throw TypeError(`${meetingId} is not a string`)

        if (!id.trim()) throw new ValueError('id is empty or blank')
        if (!meetingId.trim()) throw new ValueError('meetingId is empty or blank')

        return (async () => {

            const user = await User.findById(id)

            await Meeting.updateOne({ _id: meetingId }, { $pull: { attending: user.id } })


        })()
    },

    /**
     * Lists upcoming meetings for a specific user
     * @param {string} id 
     * @returns {Promise <Object/>}
     */
    userUpcomingMeetings(id) {

        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        if (!id.trim()) throw new ValueError('id is empty or blank')

        return (async () => {

            const user = await User.findById(id)

            const meetings = await Meeting.find({ attending: { $in: [user.id] } })
                .lean()
                .sort({ date: 1 })
                .populate({ path: 'project', select: '_id' })
                .populate({ path: 'project', select: 'name' })
                .exec()

            meetings.forEach(meeting => {
                meeting.id = meeting._id.toString()
                meeting.project._id && (meeting.project.id = meeting.project._id.toString())
                delete meeting.project._id
                delete meeting._id
                delete meeting.__v
                return meeting
            })

            return meetings


        })()
    },


    /**
     * Filters project based on a series of conditions. 
     * @param {string} query 
     * @param {string} userId 
     * @returns {Promise <Object/>}
     */
    filterProjects(query, userId) {

        if (typeof query !== 'string') throw TypeError(`${query} is not a string`)
        if (typeof userId !== 'string') throw TypeError(`${userId} is not a string`)
        if (!query.trim()) throw new ValueError('query is empty or blank')
        if (!userId.trim()) throw new ValueError('userId is empty or blank')

        const queryObject = {
            name: { $regex: '' },
            skills: { $all: [] },
            location: { $regex: '' },
        }
        query.split('&').forEach((item, index) => {
            switch (index) {
                case 0:
                    queryObject.name.$regex = item.match(/[=](.*)/)[1].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "")
                    break
                case 1:
                    queryObject.skills.$all = [].concat.apply([], queryObject.skills.$all.concat([(item.match(/[=](.*)/)[1].indexOf('+') !== -1) ? item.match(/[=](.*)/)[1].split('+') : item.match(/[=](.*)/)[1]]))
                    break
                case 2:
                    queryObject.location.$regex = item.match(/[=](.*)/)[1].replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "")
                    break
            }
        })

        if (!queryObject.skills.$all.length || queryObject.skills.$all[0] === '') { delete queryObject.skills }

        if (queryObject.name.$regex === '') {
            delete queryObject.name
        } else {
            queryObject.name.$regex = new RegExp(queryObject.name.$regex, 'i')
        }

        if (queryObject.location.$regex === '') {
            delete queryObject.location
        } else {
            queryObject.location.$regex = new RegExp(queryObject.location.$regex, 'i')
        }


        return (async () => {
            const keepFields = {
                name: true,
                description: true,
                projectImage: true,
                skills: true,
                location: true,
                collaborators: true,
                owner: true

            }
            const projects = await Project.find(queryObject, keepFields).lean()
            const user = await User.findById(userId)

            projects.forEach(project => {
                project.id = project._id.toString()
                project.userSavedProjects = user.savedProjects
                delete project._id

                return project
            })

            return projects


        })()

    },


    /**
     * Update a users profile image
     * @param {string}} userId 
     * @param {Object}} file 
     */
    insertProfileImage(userId, file) {

        validate([
            { key: 'userId', value: userId, type: String },

        ])

        return (async () => {
            let user = await User.findById(userId)

            if (!user) throw new NotFoundError(`user does not exist`)

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((result, error) => {
                    if (error) return reject(error)

                    resolve(result)
                })

                file.pipe(stream)
            })

            await User.updateOne({ _id: userId }, { profileImage: result.url })

        })()
    },
    /**
     * Update a project image
     * @param {string} file 
     * @param {string} projectId 
     */
    insertProjectImage(file, projectId) {
        validate([
            { key: 'projectId', value: projectId, type: String },

        ])

        return (async () => {
            let project = await Project.findById(projectId)

            if (!project) throw new NotFoundError(`project does not exist`)

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((result, error) => {
                    if (error) return reject(error)

                    resolve(result)
                })

                file.pipe(stream)
            })

            await Project.updateOne({ _id: projectId }, { projectImage: result.url })



        })()
    },
    /**
     * Retrieve an image with the desired specifications
     * @param {string} id 
     * @param {string} width 
     * @param {string} height 
     * @returns {string}
     */
    returnUserImage(id, width, height) {
        if (typeof id !== 'string') throw TypeError(`${id} is not a string`)
        return (async () => {
            const user = await User.findById(id)

            const picture = cloudinary.url(user.profileImage, { width: width, height: height, gravity: "face", radius: "max", crop: "fill", fetch_format: "auto", type: "fetch" })


            return picture
        })()
    },

    /**
     * Retrieves an image with the desired specs
     * @param {string} projectId 
     * @returns {string}
     */
    returnProjectPageImages(projectId) {
        if (typeof projectId !== 'string') throw TypeError(`${projectId} is not a string`)

        return (async () => {
            const project = await Project.findById(projectId)

            const picture = cloudinary.url(project.projectImage, { width: 300, height: 300, crop: "scale", fetch_format: "auto", type: "fetch" })

            return picture
        })()
    },

    /**
     * Sends a message between users. If no conversation exists one will be added
     * @param {string} senderId 
     * @param {string} receiverId 
     * @param {string} text 
     */
    sendMessage(senderId, receiverId, text) {
        if (typeof senderId !== 'string') throw TypeError(`${senderId} is not a string`)
        if (typeof receiverId !== 'string') throw TypeError(`${receiverId} is not a string`)
        if (typeof text !== 'string') throw TypeError(`${text} is not a string`)
        if (!senderId.trim()) throw new ValueError('senderId is empty or blank')
        if (!receiverId.trim()) throw new ValueError('receiverId is empty or blank')
        if (!text.trim()) throw new ValueError('text is empty or blank')

        return (async () => {
            const messages = [{
                text: text,
                sender: senderId
            }]

            const sender = await User.findById(senderId)
            const receiver = await User.findById(receiverId)
            if (!sender || !receiver) throw new NotFoundError('could not find either of the users')

            const conversation = await Conversation.findOne({ members: { $all: [sender.id, receiver.id] } })

            if (conversation) {

                await Conversation.updateOne({ _id: conversation.id }, { $push: { messages } })


            } else {

                const res = new Conversation({ members: [sender.id, receiver.id], messages })

                res.save()
            }
        })()
    },

    /**
     * Lists the messages between two users
     * @param {string} user1Id 
     * @param {string} user2Id 
     * @returns {Promise <Object/>}
     */
    listMessages(user1Id, user2Id) {
        if (typeof user1Id !== 'string') throw TypeError(`${user1Id} is not a string`)
        if (typeof user2Id !== 'string') throw TypeError(`${user2Id} is not a string`)
        return (async () => {
            const user1 = await User.findById(user1Id)

            const user2 = await User.findById(user2Id).select({ "username": 1, "profileImage": 1 }).lean();

            if (!user2) throw new NotFoundError(`could not find user with id ${user2Id}`)

            user2._id && (user2.id = user2._id.toString())
            user2._id && delete user2._id
            delete user2.__v
            const conversation = await Conversation.findOne({ members: { $all: [user1.id, user2.id] } })

            if (!conversation) throw new NotFoundError('could not find conversation')

            const message = conversation.messages[conversation.messages.length - 1]

            if (message.sender.toString() !== user1Id) {
                for (let i = conversation.messages.length - 1; i >= 0; i--) {

                    const message = conversation.messages[i]

                    if (message.sender.toString() !== user1Id && message.status === 'pending')
                        message.status = 'read'
                    else break
                }

                await conversation.save()
            }

            const newConversation = await Conversation.findOne({ members: { $all: [user1.id, user2.id] } }).lean()

            newConversation.messages.forEach(message => {
                message._id && (message.id = message._id.toString())
                message._id && delete message._id
                message.__v && delete message.__v


            })

            const output = { messages: newConversation.messages, receiver: user2 }

            return output

        })()
    },

    /**
     * Finds a conversation between two users
     * @param {string} user1Id 
     * @param {string} user2Id 
     * @returns {Promise <Object/>}
     */
    findConversation(user1Id, user2Id) {
        if (typeof user1Id !== 'string') throw TypeError(`${user1Id} is not a string`)
        if (typeof user2Id !== 'string') throw TypeError(`${user2Id} is not a string`)

        if (!user1Id.trim()) throw new ValueError('user1Id is empty or blank')
        if (!user2Id.trim()) throw new ValueError('user1Id is empty or blank')

        return (async () => {
            const user1 = await User.findById(user1Id)
            const user2 = await User.findById(user2Id)
            const conversation = await Conversation.findOne({ members: { $all: [user1.id, user2.id] } }).populate({ path: 'members', select: 'username profileImage' }).lean()
            if (conversation) {
                conversation.id = conversation._id.toString()
                delete conversation._id
                delete conversation.__v
                conversation.members.forEach(member => {
                    member._id && (member.id = member._id.toString())
                    member._id && delete member._id
                    member.__v && delete member.__v
                })
                delete conversation.messages

                return conversation
            }
            else return false

        })()

    },

    /**
     * Lists all conversations for a user
     * @param {*} userId 
     * @returns {Promise <Object>}
     */
    listConversations(userId) {
        if (typeof userId !== 'string') throw TypeError(`${userId} is not a string`)
        if (!userId.trim()) throw new ValueError('userId is empty or blank')

        return (async () => {
            const user = await User.findById(userId)

            if (!user) throw new NotFoundError(`could not find user with id ${userId}`)

            const conversations = await Conversation.find({ members: user.id }).populate({ path: 'members', select: 'username profileImage' }).lean()

            conversations.forEach(conversation => {
                conversation._id && (conversation.id = conversation._id.toString())
                conversation._id && delete conversation._id
                delete conversation.__v
                conversation.members.forEach(member => {
                    member._id && (member.id = member._id.toString())
                    member._id && delete member._id
                    member.__v && delete member.__v
                })

                conversation.messages.forEach(message => {
                    message._id && (message.id = message._id.toString())
                    message._id && delete message._id
                    message.__v && delete message.__v
                })

                return conversation

            })

            for (var i = 0; i < conversations.length; i++) {
                conversations[i].pendingMessages = 0

                for (var j = 0; j < conversations[i].messages.length; j++) {

                    if (conversations[i].messages[j].status === 'pending' && conversations[i].messages[j].sender.toString() !== userId) {


                        conversations[i].pendingMessages++
                    }
                }
            }


            return conversations
        })()
    }


}

module.exports = logic 