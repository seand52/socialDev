'use strict';
const { mongoose, models: { User, Project, Meeting, Conversation } } = require('data')
const logic = require('.')
const fs = require('fs')
const { AlreadyExistsError, ValueError, AuthError, NotFoundError } = require('../errors')
const { expect } = require('chai')
const MONGO_URL = 'mongodb://localhost:27017/socialdev-test'
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: 'dql7wn1ej',
    api_key: '853219916242289',
    api_secret: 'xHAmRRBTudticrVV4h0K1sXPVpg'
})
describe('logic', () => {
    before(() => mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }))

    beforeEach(() => Promise.all([User.deleteMany(), Project.deleteMany(), Meeting.deleteMany(), Conversation.deleteMany()]))

    describe('user', () => {
        describe('register', () => {
            let name, email, username, password

            beforeEach(() => {
                name = `name-${Math.random()}`
                email = `email-${Math.random()}@gmail.com`
                username = `username-${Math.random()}`
                password = `password-${Math.random()}`
            })

            it('should succeed on correct data', async () => {
                const res = await logic.registerUser(name, email, username, password)

                expect(res).to.be.undefined

                const users = await User.find()

                expect(users.length).to.equal(1)

                const [user] = users

                expect(user.id).to.be.a('string')
                expect(user.name).to.equal(name)
                expect(user.email).to.equal(email)
                expect(user.username).to.equal(username)
                expect(user.password).to.equal(password)
                expect(user.bio).to.equal('Bio is empty')
                expect(user.githubProfile).to.equal('Github profile is empty')
                expect(user.city).to.equal('City is empty')
            })

            it('should fail on undefined name', () => {
                expect(() => logic.registerUser(undefined, email, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty name', () => {
                expect(() => logic.registerUser('', email, username, password)).to.throw(ValueError, 'name is empty or blank')
            })

            it('should fail on blank name', () => {
                expect(() => logic.registerUser('   \t\n', email, username, password)).to.throw(ValueError, 'name is empty or blank')
            })

            it('should fail on empty email', () => {
                expect(() => logic.registerUser(name, '', username, password)).to.throw(ValueError, 'email is empty or blank')
            })

            it('should fail on blank email', () => {
                expect(() => logic.registerUser(name, '   \t\n', username, password)).to.throw(ValueError, 'email is empty or blank')
            })


            it('should fail on empty username email', () => {
                expect(() => logic.registerUser(name, email, '', password)).to.throw(ValueError, 'username is empty or blank')
            })
            it('should fail on blank username', () => {
                expect(() => logic.registerUser(name, email, '     ', password)).to.throw(ValueError, 'username is empty or blank')
            })

            it('should fail on empty username email', () => {
                expect(() => logic.registerUser(name, email, username, '')).to.throw(ValueError, 'password is empty or blank')
            })
            it('should fail on blank username', () => {
                expect(() => logic.registerUser(name, email, username, '        ')).to.throw(ValueError, 'password is empty or blank')
            })

            it('should fail on existant email', async () => {
                const user1 = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })
                await user1.save()

                try {

                    await logic.registerUser('John', 'doe@gmail.com', 'jd', '123')

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(AlreadyExistsError)
                    expect(err.message).to.equal(`email ${'doe@gmail.com'} is already registered`)
                }


            })


        })

        describe('authenticate', () => {
            let user

            beforeEach(() => (user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })).save())

            it('should authenticate on correct credentials', async () => {
                const { username, password } = user

                const id = await logic.authenticateUser(username, password)

                expect(id).to.exist
                expect(id).to.be.a('string')

                const users = await User.find()

                const [_user] = users

                expect(_user.id).to.equal(id)
            })

            it('should fail on undefined username', () => {
                expect(() => logic.authenticateUser(undefined, user.password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on undefined passowrd', () => {
                expect(() => logic.authenticateUser(user.username, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on blank username', () => {
                expect(() => logic.authenticateUser('', user.password)).to.throw(ValueError, 'username is empty or blank')
            })

            it('should fail on blank passowrd', () => {
                expect(() => logic.authenticateUser(user.username, '')).to.throw(ValueError, 'password is empty or blank')
            })

            it('should fail on existant email', async () => {

                try {

                    await logic.authenticateUser('asdf', 'fwefw')

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(AuthError)
                    expect(err.message).to.equal(`invalid username or password`)
                }


            })



        }),

            describe('retrieve user info', () => {
                let user

                beforeEach(async () => {
                    user = new User({ name: 'John', email: 'doe2@gmail.com', username: 'jd', password: '123' })

                    await user.save()
                })

                it('should succeed on valid id', async () => {
                    const _user = await logic.retrieveUser(user.id)

                    expect(_user).not.to.be.instanceof(User)

                    const { id, name, email, username, password, bio, githubProfile, savedProjects, skills, city } = _user

                    expect(bio).to.be.undefined
                    expect(githubProfile).to.be.undefined
                    expect(savedProjects).to.be.undefined
                    expect(skills).to.be.undefined
                    expect(city).to.be.undefined


                    expect(id).to.exist
                    expect(id).to.be.a('string')
                    expect(id).to.equal(user.id)
                    expect(name).to.equal(user.name)
                    expect(email).to.equal(user.email)
                    expect(username).to.equal(user.username)
                    expect(password).to.be.undefined
                })

                it('should undefined id', () => {
                    expect(() => logic.retrieveUser(undefined)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should blank id', () => {
                    expect(() => logic.retrieveUser('')).to.throw(ValueError, 'id is empty or blank')
                })

                it('should empty id', () => {
                    expect(() => logic.retrieveUser('   ')).to.throw(ValueError, 'id is empty or blank')
                })

                it('should throw error if user not found', async () => {

                    try {

                        await logic.retrieveUser('5c07dae85729ae63c68447ba')

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)

                        expect(err.message).to.equal(`user with id ${'5c07dae85729ae63c68447ba'} not found`)
                    }
                })

            }),

            describe('retrieve additional profile info', () => {
                let user

                beforeEach(async () => {
                    user = new User({ name: 'John', email: 'doe2@gmail.com', username: 'jd', password: '123' })

                    await user.save()
                })

                it('should succeed on valid id', async () => {
                    const _user = await logic.retrieveProfileInfo(user.id)

                    expect(_user).not.to.be.instanceof(User)

                    const { id, name, email, username, password, bio, githubProfile, savedProjects, skills, city } = _user




                    expect(password).to.be.undefined
                    expect(id).to.exist
                    expect(id).to.be.a('string')
                    expect(id).to.equal(user.id)
                    expect(bio).to.equal(user.bio)
                    expect(githubProfile).to.equal(user.githubProfile)
                    expect(JSON.stringify(savedProjects)).to.equal(JSON.stringify(user.savedProjects))
                    expect(JSON.stringify(skills)).to.equal(JSON.stringify(user.skills))
                    expect(city).to.equal(user.city)


                })

                it('should undefined id', () => {
                    expect(() => logic.retrieveProfileInfo(undefined)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should blank id', () => {
                    expect(() => logic.retrieveProfileInfo('')).to.throw(ValueError, 'id is empty or blank')
                })

                it('should empty id', () => {
                    expect(() => logic.retrieveProfileInfo('   ')).to.throw(ValueError, 'id is empty or blank')
                })

                it('should fail on non existant user', async () => {

                    try {
                        await logic.retrieveProfileInfo('5c07dae85729ae63c68447ba')

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id 5c07dae85729ae63c68447ba not found`)
                    }
                })


            }),



            describe('update user profile', () => {
                let user

                beforeEach(() => (user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })).save())

                it('should update on correct data and password', async () => {
                    const { id, bio, githubProfile, city, skills } = user

                    const newBio = `${bio}-${Math.random()}`
                    const newGithubProfile = `${githubProfile}-${Math.random()}`
                    const newCity = `${city}-${Math.random()}`
                    const newSkills = ['react', 'mongoose', 'javascript']

                    const res = await logic.updateProfile(id, newBio, newGithubProfile, newCity, newSkills)

                    expect(res).to.be.undefined

                    const _users = await User.find()

                    const [_user] = _users

                    expect(_user.bio).to.equal(newBio)

                    expect(_user.githubProfile).to.equal(newGithubProfile)
                    expect(_user.city).to.equal(newCity)
                    expect(newSkills.length).to.equal(3)

                })

                it('should update on correct bio (and other fields null)', async () => {
                    const { id, bio, githubProfile, city, skills } = user

                    const newBio = `${bio}-${Math.random()}`

                    const res = await logic.updateProfile(id, newBio, null, null, null)

                    expect(res).to.be.undefined

                    const _users = await User.find()

                    const [_user] = _users

                    expect(_user.bio).to.equal(newBio)

                    expect(_user.githubProfile).to.equal(githubProfile)
                    expect(_user.city).to.equal(city)
                    expect(JSON.stringify(_user.skills)).to.equal(JSON.stringify(skills))

                })

                it('should update on correct githubProfile (and other fields null)', async () => {
                    const { id, bio, githubProfile, city, skills } = user

                    const newGithubProfile = `${githubProfile}-${Math.random()}`

                    const res = await logic.updateProfile(id, bio, newGithubProfile, null, null)

                    expect(res).to.be.undefined

                    const _users = await User.find()

                    const [_user] = _users

                    expect(_user.githubProfile).to.equal(newGithubProfile)

                    expect(_user.bio).to.equal(bio)
                    expect(_user.city).to.equal(city)
                    expect(JSON.stringify(_user.skills)).to.equal(JSON.stringify(skills))

                })

                it('should update on correct city (and other fields null)', async () => {
                    const { id, bio, githubProfile, city, skills } = user

                    const newCity = `${city}-${Math.random()}`

                    const res = await logic.updateProfile(id, bio, githubProfile, newCity, null)

                    expect(res).to.be.undefined

                    const _users = await User.find()

                    const [_user] = _users

                    expect(_user.city).to.equal(newCity)

                    expect(_user.bio).to.equal(bio)
                    expect(_user.githubProfile).to.equal(githubProfile)
                    expect(JSON.stringify(_user.skills)).to.equal(JSON.stringify(skills))

                })

                it('should fail undefined id', () => {
                    expect(() => logic.updateProfile(undefined, user.bio, user.githubProfile, user.city, user.skills)).to.throw(TypeError, 'undefined is not a string')
                })
                it('should  failundefined bio', () => {
                    expect(() => logic.updateProfile(user.id, undefined, user.githubProfile, user.city, user.skills)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail undefined github profile', () => {
                    expect(() => logic.updateProfile(user.id, user.bio, undefined, user.city, user.skills)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail undefined city', () => {
                    expect(() => logic.updateProfile(user.id, user.bio, user.githubProfile, undefined, user.skills)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail if id is not found', async () => {

                    try {
                        await logic.updateProfile('5c07dae85729ae63c68447ba', user.bio, user.githubProfile, user.city, user.skills)

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id 5c07dae85729ae63c68447ba not found`)
                    }

                })


            })

        describe('projects', () => {
            describe('add a project ', () => {
                let user, name, description, skills, maxMembers, location

                beforeEach(async () => {
                    user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

                    name = `text-${Math.random()}`
                    description = `text-${Math.random()}`
                    skills = [`text-${Math.random()}`, `text-${Math.random()}`, `text-${Math.random()}`]
                    maxMembers = `${Math.random()}`
                    location = 'barcelona'

                    await user.save()
                })

                it('should succeed on correct data', async () => {
                    const res = await logic.addNewProject(user.id, name, description, skills, maxMembers, location)

                    expect(res).to.be.undefined

                    const projects = await Project.find()

                    const [project] = projects

                    expect(project.name).to.equal(name)

                    expect(project.description).to.equal(description)

                    expect(JSON.stringify(project.skills)).to.equal(JSON.stringify(skills))

                    expect(project.maxMembers).to.equal(maxMembers)
                    expect(project.currentMembers).to.equal(1)
                    expect(project.location).to.equal(location)
                    expect(project.owner.toString()).to.equal(user.id)
                })

                it('should fail undefined user id', () => {
                    expect(() => logic.addNewProject(undefined, name, description, skills, maxMembers, location).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail undefined user name', () => {
                    expect(() => logic.addNewProject(user.id, undefined, description, skills, maxMembers, location).to.throw(TypeError, 'undefined is not a string'))
                })
                it('should fail undefined user description', () => {
                    expect(() => logic.addNewProject(user.id, name, undefined, skills, maxMembers, location).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail undefined user maxMembers', () => {
                    expect(() => logic.addNewProject(user.id, name, description, skills, undefined, location).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail undefined location', () => {
                    expect(() => logic.addNewProject(user.id, name, description, skills, maxMembers, undefined).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail blank user id', () => {
                    expect(() => logic.addNewProject('', name, description, skills, maxMembers, location).to.throw(ValueError, 'id is empty or blank'))
                })

                it('should fail blank user name', () => {
                    expect(() => logic.addNewProject(user.id, '', description, skills, maxMembers, location).to.throw(ValueError, 'name is empty or blank'))
                })
                it('should fail blank user description', () => {
                    expect(() => logic.addNewProject(user.id, name, '', skills, maxMembers, location).to.throw(ValueError, 'description is empty or blank'))
                })

                it('should fail blank user maxMembers', () => {
                    expect(() => logic.addNewProject(user.id, name, description, skills, '', location).to.throw(ValueError, 'maxMembers is empty or blank'))
                })

                it('should fail blank location', () => {
                    expect(() => logic.addNewProject(user.id, name, description, skills, maxMembers, '').to.throw(ValueError, 'location is empty or blank'))
                })

                it('should fail empty user id', () => {
                    expect(() => logic.addNewProject('      \n', name, description, skills, maxMembers, location).to.throw(ValueError, 'id is empty or blank'))
                })

                it('should fail empty user name', () => {
                    expect(() => logic.addNewProject(user.id, '      \n', description, skills, maxMembers, location).to.throw(ValueError, 'name is empty or blank'))
                })
                it('should fail empty user description', () => {
                    expect(() => logic.addNewProject(user.id, name, '      \n', skills, maxMembers, location).to.throw(ValueError, 'description is empty or blank'))
                })

                it('should fail empty user maxMembers', () => {
                    expect(() => logic.addNewProject(user.id, name, description, skills, '      \n', location).to.throw(ValueError, 'maxMembers is empty or blank'))
                })

                it('should fail empty location', () => {
                    expect(() => logic.addNewProject(user.id, name, description, skills, maxMembers, '      \n').to.throw(ValueError, 'location is empty or blank'))
                })

                it('should fail if user not found', async () => {
                    try {

                        await logic.addNewProject('5c07dae85729ae63c68447ba', name, description, skills, maxMembers, location)

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id 5c07dae85729ae63c68447ba not found`)
                    }

                })
            })

            describe('delete a project and associated meeings', () => {
                let user, project, meeting1, meeting2, meeting3

                beforeEach(async () => {
                    user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })
                    project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })
                    meeting1 = new Meeting({ project: project.id, date: Date.now(), location: 'madrid' })
                    meeting2 = new Meeting({ project: project.id, date: Date.now(), location: 'madrid' })
                    meeting3 = new Meeting({ project: project.id, date: Date.now(), location: 'madrid' })

                    await user.save()
                    await project.save()
                    await meeting1.save()
                    await meeting2.save()
                    await meeting3.save()

                })

                it('should succeed on correct data', async () => {

                    await logic.deleteProject(user.id, project.id)

                    const _project = await Project.findById(project.id)

                    const _meetings = await Meeting.find({ project: project.id })

                    expect(_project).to.equal(null)

                    expect(_meetings.length).to.equal(0)





                })

                it('should fail undefined user id', () => {
                    expect(() => logic.deleteProject(undefined, project.id).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail null user id', () => {
                    expect(() => logic.deleteProject(null, project.id).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail boolean user id', () => {
                    expect(() => logic.deleteProject(null, project.id).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail numeric user id', () => {
                    expect(() => logic.deleteProject(12, project.id).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail undefined user id', () => {
                    expect(() => logic.deleteProject(user.id, undefined).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail null user id', () => {
                    expect(() => logic.deleteProject(user.id, null).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail boolean user id', () => {
                    expect(() => logic.deleteProject(user.id, true).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail numeric user id', () => {
                    expect(() => logic.deleteProject(user.id, 12).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.deleteProject('', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.deleteProject(user.id, '').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.deleteProject('    \n', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.deleteProject(user.id, '   \n').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail if not project owner', async () => {
                    try {

                        await logic.deleteProject('5c07dae85729ae63c68447ba', project.id)

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`only project owner can delete a project`)
                    }

                })


            })

            describe('save a project ', () => {
                let user, user2, project

                beforeEach(async () => {

                    user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

                    user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123' })

                    project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id })

                    await user.save()
                    await user2.save()
                    await project.save()
                })

                it('should succeed on correct data', async () => {

                    await logic.saveProject(user.id, project.id)

                    const _user = await User.findById(user.id)

                    expect(_user.savedProjects.length).to.equal(1)

                    expect(_user.savedProjects[0].toString()).to.equal(project.id)



                })


                it('should succeed on listing saved projects', async () => {
                    const project2 = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id })
                    const project3 = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id })

                    await project2.save()
                    await project3.save()
                    const { name, description, skills, beginnerFriendly, maxMembers, owner } = project

                    await logic.saveProject(user.id, project.id)
                    await logic.saveProject(user.id, project3.id)

                    const projects = await logic.listSavedProjects(user.id)

                    expect(projects.length).to.equal(2)

                    expect(projects.name).to.equal
                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.saveProject(undefined, project.id).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.saveProject(user.id, undefined).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.saveProject('', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.saveProject(user.id, '').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.saveProject('    \n', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.saveProject(user.id, '   \n').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail if not project owner', async () => {
                    try {

                        await logic.saveProject(user.id, '5c07dae85729ae63c68447ba')

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`project with id 5c07dae85729ae63c68447ba not found`)
                    }

                })

            })

            describe('remove a project from saved', () => {
                let user, user2, project

                beforeEach(async () => {
                    user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })
                    project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user.id] })
                    await user.save()
                    await project.save()
                    user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123', savedProjects: [project.id] })
                    await user2.save()

                })

                it('should succeed on correct data', async () => {

                    await logic.removeSavedProject(user2.id, project.id)
                    const _user2 = await User.findById(user2.id)

                    expect(_user2.savedProjects.length).to.equal(0)

                })
                it('should fail on undefined user id', () => {
                    expect(() => logic.removeSavedProject(undefined, project.id).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.removeSavedProject(user.id, undefined).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.removeSavedProject('', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.removeSavedProject(user.id, '').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.removeSavedProject('    \n', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.removeSavedProject(user.id, '   \n').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail if user not found', async () => {
                    try {

                        await logic.removeSavedProject('5c07dae85729ae63c68447ba', project.id)

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id 5c07dae85729ae63c68447ba not found`)
                    }

                })

                it('should fail if not project owner', async () => {
                    try {

                        await logic.removeSavedProject(user.id, '5c07dae85729ae63c68447ba')

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`project with id 5c07dae85729ae63c68447ba not found`)
                    }

                })
            })

            describe('leave a project (stop being collaborator)', () => {
                let user, user2, project, meeting1

                beforeEach(async () => {
                    user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })
                    user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123' })
                    project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user2.id] })
                    meeting1 = new Meeting({ project: project.id, date: Date.now(), location: 'barcelona', attending: [user2.id] })

                    await user.save()
                    await user2.save()
                    await project.save()
                    await meeting1.save()
                })

                it('should succeed on correct data', async () => {

                    await logic.leaveProject(user2.id, project.id)

                    const _project = await Project.findById(project.id)

                    expect(_project.collaborators.length).to.equal(0)

                    const _meeting = await Meeting.findById(meeting1.id)

                    expect(_meeting.attending.length).to.equal(0)

                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.leaveProject(undefined, project.id).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.leaveProject(user.id, undefined).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.leaveProject('', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.leaveProject(user.id, '').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.leaveProject('    \n', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.leaveProject(user.id, '   \n').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail if not project owner', async () => {
                    try {

                        await logic.leaveProject('5c07dae85729ae63c68447ba', project.id)

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user does not exist`)
                    }

                })
            })

            describe('list projects', () => {
                let user, project, project2

                beforeEach(async () => {
                    user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

                    project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })

                    project2 = new Project({ name: 'test2', description: 'testdescription2', skills: ['react2', 'mongoose2', 'javascript2'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })

                    await user.save()
                    await project.save()
                    await project2.save()
                })

                it('should succeed on listing all projects where user is owner', async () => {

                    const projects = await logic.listOwnProjects(user.id)
                    expect(projects).not.to.be.undefined

                    expect(projects.length).to.equal(2)

                    const _projects = await Project.find()

                    expect(_projects.length).to.equal(2)

                    expect(projects.length).to.equal(_projects.length)

                    const [_project, _project2] = _projects

                    expect(_project.id).to.equal(project.id)
                    expect(_project.name).to.equal(project.name)
                    expect(_project.description).to.equal(project.description)
                    expect(_project.beginnerFriendly).to.equal(project.beginnerFriendly)
                    expect(_project.maxMembers).to.equal(project.maxMembers)

                    expect(_project2.id).to.equal(project2.id)
                    expect(_project2.name).to.equal(project2.name)
                    expect(_project2.description).to.equal(project2.description)
                    expect(_project2.beginnerFriendly).to.equal(project2.beginnerFriendly)
                    expect(_project2.maxMembers).to.equal(project2.maxMembers)

                    const [__project, __project2] = projects

                    expect(__project).not.to.be.instanceof(Project)
                    expect(__project2).not.to.be.instanceof(Project)

                    expect(_project.id).to.equal(__project.id)
                    expect(_project.name).to.equal(__project.name)
                    expect(_project.description).to.equal(__project.description)
                    expect(_project.beginnerFriendly).to.equal(__project.beginnerFriendly)
                    expect(_project.maxMembers).to.equal(__project.maxMembers)

                    expect(_project2.id).to.equal(__project2.id)
                    expect(_project2.name).to.equal(__project2.name)
                    expect(_project2.description).to.equal(__project2.description)
                    expect(_project2.beginnerFriendly).to.equal(__project2.beginnerFriendly)
                    expect(_project2.maxMembers).to.equal(__project2.maxMembers)


                })

                it('should fail to retrieve objects if user not found', async () => {

                    try {
                        await logic.listOwnProjects('5c07dae85729ae63c68447ba')

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id 5c07dae85729ae63c68447ba not found`)
                    }

                })

                it('should succeed on listing all projects where user a collaborator', async () => {
                    const user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123' })

                    let project3 = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id, collaborators: [user.id] })

                    let project4 = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id, collaborators: [user.id] })

                    let project5 = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id, collaborators: [user.id] })

                    await user2.save()
                    await project3.save()
                    await project4.save()
                    await project5.save()

                    const projects = await logic.listCollaboratingProjects(user.id)

                    expect(projects).not.to.be.undefined

                    expect(projects.length).to.equal(3)

                    const _projects = await Project.find({ collaborators: user._id })

                    expect(_projects.length).to.equal(3)

                    expect(projects.length).to.equal(_projects.length)

                    const [_project1, _project2, _project3] = _projects

                    expect(_project1.collaborators[0].toString()).to.equal(user.id)
                    expect(_project2.collaborators[0].toString()).to.equal(user.id)
                    expect(_project3.collaborators[0].toString()).to.equal(user.id)


                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.listOwnProjects(undefined).to.throw(ValueError, 'undefined is not a string'))
                })
                it('should fail on blank user id', () => {
                    expect(() => logic.listOwnProjects('').to.throw(ValueError, 'id is empty or blank'))
                })
                it('should fail on empty user id', () => {
                    expect(() => logic.listOwnProjects('    \n').to.throw(ValueError, 'id is empty or blank'))
                })

                it('should fail if user not found', async () => {
                    try {

                        await logic.listCollaboratingProjects('5c07dae85729ae63c68447ba')

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`user with id 5c07dae85729ae63c68447ba not found`)
                    }

                })

            })

            describe('query projects', () => {
                let user, project, project2, project3, project4, project5
                beforeEach(async () => {
                    user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

                    project = new Project({ name: 'react', description: 'testdescription1', skills: ['react', 'mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Barcelona' })

                    project2 = new Project({ name: 'reach', description: 'testdescription2', skills: ['mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Madrid' })

                    project3 = new Project({ name: 'mongoose', description: 'testdescription3', skills: ['react', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Barcelona' })

                    project4 = new Project({ name: 'rpo', description: 'testdescription4', skills: ['mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Bilbao' })

                    project5 = new Project({ name: 'oterea', description: 'testdescription5', skills: ['react', 'mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Barcelona' })

                    await user.save()
                    await project.save()
                    await project2.save()
                    await project3.save()
                    await project4.save()
                    await project5.save()
                })

                it('should successfuly query for projects based on a query', async () => {

                    const query = 'q=MONGOOSE&f=&c='

                    const projects = await logic.filterProjects(query, user.id)

                    expect(projects.length).to.equal(1)

                    const [_project1, _project2, _project3] = projects
                })

                it('should successfuly query for projects based on a query and filter', async () => {

                    const query = 'q=&f=react+javascript&c=Barcelona'

                    const projects = await logic.filterProjects(query, user.id)

                    expect(projects.length).to.equal(3)

                    const [_project1, _project2, _project3] = projects
                })

                it('should successfuly filter results based on skills', async () => {

                    const query = 'q=&f=javascript'

                    const projects = await logic.filterProjects(query, user.id)

                    expect(projects.length).to.equal(5)

                    const [_project1, _project2, _project3] = projects
                })

                it('should fail on undefined query', () => {
                    expect(() => logic.filterProjects(undefined, user.id).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.filterProjects('q=&f=javascript', undefined).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on empty query', () => {
                    expect(() => logic.filterProjects('', user.id).to.throw(ValueError, 'query is empty or blank'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.filterProjects('q=&f=javascript', '').to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on blank query', () => {
                    expect(() => logic.filterProjects('    \n', user.id).to.throw(ValueError, 'query is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.filterProjects('q=&f=javascript', '   \n').to.throw(ValueError, 'userId is empty or blank'))
                })
            })



            describe('retrieve project info', () => {
                let user, project, user2

                beforeEach(async () => {

                    user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })
                    user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123', skills: ['javascript', 'python'] })

                    project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user2.id], pendingCollaborators: [user2.id] })

                    await user.save()
                    await user2.save()
                    await project.save()
                })

                it('should retrieve information on correct project ID', async () => {
                    const { name, description, skills, beginnerFriendly, maxMembers, owner } = project

                    const _project = await logic.retrieveProjectInfo(project.id, user2.id)


                    expect(_project.name).to.equal(name)
                    expect(_project.description).to.equal(description)
                    expect(JSON.stringify(_project.skills)).to.equal(JSON.stringify(skills))
                    expect(_project.beginnerFriendly).to.equal(beginnerFriendly)
                    expect(_project.maxMembers).to.equal(maxMembers)
                    expect(_project.currentMembers).to.equal(1)

                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.retrieveProjectInfo(undefined, project.id).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on null user id', () => {
                    expect(() => logic.retrieveProjectInfo(null, project.id).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on boolean user id', () => {
                    expect(() => logic.retrieveProjectInfo(true, project.id).to.throw(ValueError, 'undefined is not a string'))
                })


                it('should fail on numeric user id', () => {
                    expect(() => logic.retrieveProjectInfo(12, project.id).to.throw(ValueError, 'undefined is not a string'))
                })


                it('should fail on undefined user id', () => {
                    expect(() => logic.retrieveProjectInfo(user.id, undefined).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on null user id', () => {
                    expect(() => logic.retrieveProjectInfo(user.id, null).to.throw(ValueError, 'undefined is not a string'))
                })
                it('should fail on boolean user id', () => {
                    expect(() => logic.retrieveProjectInfo(user.id, true).to.throw(ValueError, 'undefined is not a string'))
                })
                it('should fail on numeric user id', () => {
                    expect(() => logic.retrieveProjectInfo(user.id, 12).to.throw(ValueError, 'undefined is not a string'))
                })
                it('should fail on empty user id', () => {
                    expect(() => logic.retrieveProjectInfo('', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.retrieveProjectInfo(user.id, '').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.retrieveProjectInfo('    \n', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.retrieveProjectInfo(user.id, '   \n').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail if not project owner', async () => {
                    try {

                        await logic.retrieveProjectInfo('5c07dae85729ae63c68447ba', user.id)

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)
                        expect(err.message).to.equal(`project with id 5c07dae85729ae63c68447ba not found`)
                    }

                })
            })



            describe('Request collaboration', () => {
                let user, user2, project

                beforeEach(async () => {

                    user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

                    user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123' })

                    project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })

                    await user.save()
                    await user2.save()
                    await project.save()
                })

                it('should add user2 into pending collaborators list', async () => {
                    expect(project.owner.toString()).to.equal(user.id.toString())

                    const res = await logic.requestCollaboration(user2.id, project.id)

                    const _projects = await Project.find()

                    expect(_projects.length).to.equal(1)

                    const [_project] = _projects

                    expect(_project.pendingCollaborators.length).to.equal(1)

                    expect(_project.pendingCollaborators[0].toString()).to.equal(user2.id)

                })

                it('should add collaborators into collaborator array when accepted', async () => {

                    const decision = 'accept'

                    expect(project.owner.toString()).to.equal(user.id.toString())

                    await logic.requestCollaboration(user2.id, project.id)

                    await logic.handleCollaboration(user.id, user2.id, project.id, decision)

                    const _projects = await Project.find()

                    const [_project] = _projects

                    expect(_project.pendingCollaborators.length).to.equal(0)

                    expect(_project.collaborators.length).to.equal(1)

                    expect(_project.collaborators[0].toString()).to.equal(user2.id)


                })

                it('should remove collaborators from pending collaborators when rejected', async () => {

                    const decision = 'reject'

                    expect(project.owner.toString()).to.equal(user.id.toString())

                    await logic.requestCollaboration(user2.id, project.id)

                    await logic.handleCollaboration(user.id, user2.id, project.id, decision)

                    const _projects = await Project.find()

                    const [_project] = _projects

                    expect(_project.pendingCollaborators.length).to.equal(0)

                    expect(_project.collaborators.length).to.equal(0)


                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.handleCollaboration(undefined, user2.id, project.id, 'accept').to.throw(ValueError, 'projectId is empty or blank'))
                })
                it('should fail on null user id', () => {
                    expect(() => logic.handleCollaboration(null, user2.id, project.id, 'accept').to.throw(ValueError, 'projectId is empty or blank'))
                })
                it('should fail on boolean user id', () => {
                    expect(() => logic.handleCollaboration(true, user2.id, project.id, 'accept').to.throw(ValueError, 'projectId is empty or blank'))
                })
                it('should fail on numeric user id', () => {
                    expect(() => logic.handleCollaboration(12, user2.id, project.id, 'accept').to.throw(ValueError, 'projectId is empty or blank'))
                })
                it('should fail on undefined project id', () => {
                    expect(() => logic.handleCollaboration(user.id, user2.id, undefined, 'accept').to.throw(ValueError, 'projectId is empty or blank'))
                })
                it('should fail on null project id', () => {
                    expect(() => logic.handleCollaboration(user.id, user2.id, null, 'accept').to.throw(ValueError, 'projectId is empty or blank'))
                })
                it('should fail on boolean project id', () => {
                    expect(() => logic.handleCollaboration(user.id, user2.id, true, 'accept').to.throw(ValueError, 'projectId is empty or blank'))
                })
                it('should fail on numeric project id', () => {
                    expect(() => logic.handleCollaboration(user.id, user2.id, 12, 'accept').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail if not project owner', async () => {
                    try {

                        await logic.handleCollaboration('5c07dae85729ae63c68447ba', user2.id, project.id, 'accept')

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`not the owner of the project`)
                    }

                })

                it('it should remove a user from pending collaborators if he cancels his request', async () => {

                    expect(project.owner.toString()).to.equal(user.id.toString())

                    await logic.requestCollaboration(user2.id, project.id)

                    await logic.cancelCollaborationRequest(user2.id, project.id)

                    const _projects = await Project.find()

                    const [_project] = _projects

                    expect(_project.pendingCollaborators.length).to.equal(0)

                    expect(_project.collaborators.length).to.equal(0)


                })

                it('should fail if the project is full', async () => {
                    const project2 = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '1', owner: user.id })
                    const user3 = new User({ name: 'John3', email: 'doe3@gmail.com', username: 'jd3', password: '123' })
                    await user3.save()
                    await project.save()
                    try {
                        await logic.requestCollaboration(user3.id, project2.id)

                        expect(true).to.be.false
                    } catch (err) {

                        expect(err).to.be.instanceof(NotFoundError)

                    }

                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.requestCollaboration(undefined, project.id).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.requestCollaboration(user2.id, undefined).to.throw(ValueError, 'undefined is not a string'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.requestCollaboration('', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on empty user id', () => {
                    expect(() => logic.requestCollaboration(user2.id, '').to.throw(ValueError, 'projectId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.requestCollaboration('    \n', project.id).to.throw(ValueError, 'userId is empty or blank'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.requestCollaboration(user2.id, '   \n').to.throw(ValueError, 'projectId is empty or blank'))
                })


            })

        })




    })

    describe('retrieve collaborations pending', () => {
        let user, user5, project, project2, project3, project4, user2

        beforeEach(async () => {
            user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

            user5 = new User({ name: 'John15', email: 'doe15@gmail.com', username: 'jd15', password: '12315' })

            user2 = new User({ name: 'John515', email: 'doe155@gmail.com', username: 'jd151', password: '123115' })

            project = new Project({ name: 'react', description: 'testdescription1', skills: ['react', 'mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, pendingCollaborators: [user5.id] })

            project2 = new Project({ name: 'reach', description: 'testdescription2', skills: ['mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, pendingCollaborators: [user5.id] })

            project3 = new Project({ name: 'mongoose', description: 'testdescription3', skills: ['react', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })

            project4 = new Project({ name: 'mongoose', description: 'testdescription3', skills: ['react', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user5.id, pendingCollaborators: [user.id] })



            await user.save()
            await project.save()
            await project2.save()
            await project3.save()
            await user5.save()
            await user2.save()
            await project4.save()
        })

        it('should retrieve projects that have pending collaborators for a user', async () => {


            const projects = await logic.retrievePendingCollaboratorProjects(user.id)
            expect(projects.length).to.equal(2)

            const [_project, _project2] = projects

            expect(_project.id).to.equal(project.id)
            expect(_project.name).to.equal(project.name)
            expect(_project2.id).to.equal(project2.id)
            expect(_project2.name).to.equal(project2.name)

        })


        it('should fail on undefined user id', () => {
            expect(() => logic.retrievePendingCollaboratorProjects(undefined).to.throw(TypeError, 'undefined is not a string'))
        })

        it('should fail on blank user id', () => {
            expect(() => logic.retrievePendingCollaboratorProjects('').to.throw(ValueError, 'undefined is not a string'))
        })

        it('should fail on empty user id', () => {
            expect(() => logic.retrievePendingCollaboratorProjects('       \n').to.throw(ValueError, 'userId is empty or blank'))
        })

        describe('should remove a collaborator from a project', () => {
            let user, project, user2, user3

            beforeEach(async () => {
                user = new User({ name: 'John2', email: 'do21241e@gmail.com', username: 'jd2124214', password: '123' })

                user2 = new User({ name: 'John511241245', email: 'doe1512341235@gmail.com', username: 'jd1124151', password: '123115' })

                user3 = new User({ name: 'John51124123121245', email: 'doe1512341212312335@gmail.com', username: 'jd112412312151', password: '123115' })

                project = new Project({ name: 'react', description: 'testdescription1', skills: ['react', 'mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user2.id, user3.id] })


                await user.save()
                await user2.save()
                await user3.save()
                await project.save()
            })

            it('should retrieve projects that have pending collaborators for a user', async () => {


                await logic.removeCollaboratorFromProject(user.id, user2.id, project.id)
                const _project = await Project.findById(project.id)
                expect(_project.collaborators.length).to.equal(1)
                expect(_project.collaborators[0].toString()).to.equal(user3.id.toString())



            })


            it('should fail on undefined user id', () => {
                expect(() => logic.removeCollaboratorFromProject(undefined, user2.id, project.id).to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on undefined user2 id', () => {
                expect(() => logic.removeCollaboratorFromProject(user.id, undefined, project.id).to.throw(TypeError, 'undefined is not a string'))
            })
            it('should fail on undefined project id', () => {
                expect(() => logic.removeCollaboratorFromProject(user.id, user2.id, undefined).to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on blank user id', () => {
                expect(() => logic.removeCollaboratorFromProject('', user2.id, project.id).to.throw(ValueError, 'id is empty or blank'))
            })

            it('should fail on blank user2 id', () => {
                expect(() => logic.removeCollaboratorFromProject(user.id, '', project.id).to.throw(ValueError, 'collabId is empty or blank'))
            })
            it('should fail on blank project id', () => {
                expect(() => logic.removeCollaboratorFromProject(user.id, user2.id, '').to.throw(ValueError, 'projectId is empty or blank'))
            })

            it('should fail on empty user id', () => {
                expect(() => logic.removeCollaboratorFromProject('      \n', user2.id, project.id).to.throw(ValueError, 'id is empty or blank'))
            })

            it('should fail on empty user2 id', () => {
                expect(() => logic.removeCollaboratorFromProject(user.id, '    \n', project.id).to.throw(ValueError, 'collabId is empty or blank'))
            })
            it('should fail on empty project id', () => {
                expect(() => logic.removeCollaboratorFromProject(user.id, user2.id, '    \n').to.throw(ValueError, 'projectId is empty or blank'))
            })

            it('should fail if not project owner', async () => {
                try {

                    await logic.removeCollaboratorFromProject('5c07dae85729ae63c68447ba', '5c07dae85729ae63c68447ba', project.id)

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(Error)
                    expect(err.message).to.equal(`not the owner of the project`)
                }

            })
        })

    })


    describe('meetings', () => {
        describe('add a new meeting ', () => {
            let user, project, user2

            beforeEach(async () => {
                user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })
                user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123' })

                project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })



                await user.save()
                await project.save()
            })

            it('should succeed on correct data', async () => {
                const date = Date.now()

                await logic.addMeeting(user.id, project.id, date, 'barcelona', 'test description')

                const meetings = await Meeting.find()

                expect(meetings.length).to.equal(1)

                const [_meeting] = meetings

                expect(_meeting.project.toString()).to.equal(project.id)


                expect(_meeting.location).to.equal('barcelona')


            })

            it('should fail on undefined user id', () => {
                expect(() => logic.addMeeting(undefined, project.id, date, 'barcelona', 'test description').to.throw(TypeError, 'undefined is not a string'))
            })
            it('should fail on undefined project id', () => {
                expect(() => logic.addMeeting(user.id, undefined, date, 'barcelona', 'test description').to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on undefined city', () => {
                expect(() => logic.addMeeting(user.id, project.id, date, undefined, 'test description').to.throw(TypeError, 'undefined is not a string'))
            })
            it('should fail on undefined description', () => {
                expect(() => logic.addMeeting(user.id, project.id, date, 'barcelona', undefined).to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on blank user id', () => {
                expect(() => logic.addMeeting('', project.id, date, 'barcelona', 'test description').to.throw(ValueError, 'id is empty or blank'))
            })
            it('should fail on blank project id', () => {
                expect(() => logic.addMeeting(user.id, '', date, 'barcelona', 'test description').to.throw(ValueError, 'projectId is empty or blank'))
            })

            it('should fail on blank city', () => {
                expect(() => logic.addMeeting(user.id, project.id, date, '', 'test description').to.throw(ValueError, 'city is empty or blank'))
            })
            it('should fail on blank description', () => {
                expect(() => logic.addMeeting(user.id, project.id, date, 'barcelona', '').to.throw(ValueError, 'description is empty or blank'))
            })
            it('should fail on empty user id', () => {
                expect(() => logic.addMeeting('     \n', project.id, date, 'barcelona', 'test description').to.throw(ValueError, 'id is empty or blank'))
            })
            it('should fail on empty project id', () => {
                expect(() => logic.addMeeting(user.id, '     \n', date, 'barcelona', 'test description').to.throw(ValueError, 'projectId is empty or blank'))
            })

            it('should fail on empty city', () => {
                expect(() => logic.addMeeting(user.id, project.id, date, '     \n', 'test description').to.throw(ValueError, 'city is empty or blank'))
            })
            it('should fail on empty description', () => {
                expect(() => logic.addMeeting(user.id, project.id, date, 'barcelona', '     \n').to.throw(ValueError, 'description is empty or blank'))
            })

            it('should fail if project not found', async () => {
                try {

                    await logic.addMeeting(user.id, '5c07dae85729ae63c68447ba', new Date('December 17, 2020 03:24:00'), 'barcelona', 'description')

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(NotFoundError)
                    expect(err.message).to.equal(`project with id 5c07dae85729ae63c68447ba not found`)
                }

            })

            it('should fail if meeting in the past', async () => {
                try {

                    await logic.addMeeting(user.id, '5c07dae85729ae63c68447ba', new Date('December 17, 2015 03:24:00'), 'barcelona', 'description')

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(Error)
                    expect(err.message).to.equal(`cannot create a meeting in the past`)
                }

            })

            it('should fail if not project owner', async () => {
                try {

                    await logic.addMeeting(user2.id, project.id, new Date('December 17, 2020 03:24:00'), 'barcelona', 'description')

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(Error)
                    expect(err.message).to.equal(`not the owner of the project`)
                }

            })



            it('should succeed on deleting event', async () => {
                const date = Date.now()

                await logic.addMeeting(user.id, project.id, date, 'barcelona', 'test description')

                const meetings = await Meeting.find()

                expect(meetings.length).to.equal(1)

                const [_meeting] = meetings

                expect(_meeting.project.toString()).to.equal(project.id)


                expect(_meeting.location).to.equal('barcelona')

                await logic.deleteMeeting(_meeting.id, user.id)

                const _meetings = await Meeting.find()

                expect(_meetings.length).to.equal(0)
            })

            it('should fail if not project owner', async () => {
                try {

                    await logic.deleteMeeting('5c07dae85729ae63c68447ba', user.id)

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(NotFoundError)
                    expect(err.message).to.equal(`meeting with id 5c07dae85729ae63c68447ba not found`)
                }

            })



            describe('list meetings ', () => {
                let project2, meeting1, meeting2, meeting3

                beforeEach(async () => {

                    project2 = new Project({ name: 'test12', description: 'testdescription12', skills: ['react12', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })

                    meeting1 = new Meeting({ project: project.id, attending: [user.id], date: Date.now(), location: 'barcelona' })

                    meeting2 = new Meeting({ project: project.id, date: Date.now(), location: 'madrid' })

                    meeting3 = new Meeting({ project: project2.id, date: Date.now(), location: 'bilbao' })




                    await user.save()
                    await project.save()
                    await meeting1.save()
                    await meeting2.save()
                    await meeting3.save()
                })

                it('should succeed on listing all relevant meetings for a given project', async () => {

                    const meetings = await logic.listProjectMeetings(project.id)

                    expect(meetings.length).to.equal(2)

                    const [_meeting, _meeting2] = meetings

                    expect(_meeting.project.toString()).to.equal(project.id)


                    expect(_meeting.location).to.equal('barcelona')

                    expect(_meeting2.project.toString()).to.equal(project.id)


                    expect(_meeting2.location).to.equal('madrid')


                })

                it('should fail on undefined project id', () => {
                    expect(() => logic.listProjectMeetings(undefined).to.throw(TypeError, 'undefined is not a string'))
                })
                it('should fail on blank project id', () => {
                    expect(() => logic.listProjectMeetings('').to.throw(ValueError, 'projectId is empty or blank'))
                })
                it('should fail on blank project id', () => {
                    expect(() => logic.listProjectMeetings('        \n').to.throw(ValueError, 'projectId is empty or blank'))
                })


                it('should retrieve information on a specific meeting', async () => {

                    const meeting = await logic.retrieveMeetingInfo(meeting1.id)


                    expect(meeting.project.toString()).to.equal(project.id)


                    expect(meeting.location).to.equal('barcelona')

                    expect(typeof meeting.attending[0].id).to.equal('string')


                })

                it('should fail on undefined meeting id', () => {
                    expect(() => logic.retrieveMeetingInfo(undefined).to.throw(TypeError, 'undefined is not a string'))
                })
                it('should fail on blank project id', () => {
                    expect(() => logic.retrieveMeetingInfo('').to.throw(ValueError, 'meetingId is empty or blank'))
                })
                it('should fail on blank project id', () => {
                    expect(() => logic.retrieveMeetingInfo('        \n').to.throw(ValueError, 'meetingId is empty or blank'))
                })

            })

            describe('attend meeting ', () => {
                let user2, project2, meeting1, meeting2, meeting3

                beforeEach(async () => {

                    user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                    project2 = new Project({ name: 'test12', description: 'testdescription12', skills: ['react12', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user2.id] })

                    meeting1 = new Meeting({ project: project.id, date: Date.now(), location: 'barcelona' })

                    meeting2 = new Meeting({ project: project.id, date: Date.now(), location: 'madrid' })

                    await user2.save()
                    await project2.save()
                    await meeting1.save()
                    await meeting2.save()
                })

                it('should succeed on correct data', async () => {

                    await logic.attendMeeting(user2.id, meeting1.id)

                    const meeting = await Meeting.findById(meeting1.id)

                    expect(meeting.attending.length).to.equal(1)

                    expect(meeting.attending[0].toString()).to.equal(user2.id)
                })

                it('should fail on undefined user id', () => {
                    expect(() => logic.attendMeeting(undefined, meeting1.id).to.throw(TypeError, 'undefined is not a string'))
                })
                it('should fail on undefined user id', () => {
                    expect(() => logic.attendMeeting(user2.id, undefined).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.attendMeeting('', meeting1.id).to.throw(TypeError, 'id is empty or blank'))
                })
                it('should fail on blank meeting', () => {
                    expect(() => logic.attendMeeting(user2.id, '').to.throw(TypeError, 'meetingId is empty o rblank'))
                })
                it('should fail on empty user id', () => {
                    expect(() => logic.attendMeeting('      \n', meeting1.id).to.throw(TypeError, 'id is empty or blank'))
                })
                it('should fail on blank meeting id', () => {
                    expect(() => logic.attendMeeting(user2.id, '      \n').to.throw(TypeError, 'meetingId is empty o rblank'))
                })

            })

            describe('unattend meeting ', () => {
                let user2, meeting1, meeting2, project2

                beforeEach(async () => {

                    user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                    project2 = new Project({ name: 'test12', description: 'testdescription12', skills: ['react12', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user2.id] })

                    meeting1 = new Meeting({ project: project.id, date: Date.now(), location: 'barcelona', attending: [user2.id] })

                    meeting2 = new Meeting({ project: project.id, date: Date.now(), location: 'madrid' })

                    await user2.save()
                    await project2.save()
                    await meeting1.save()
                    await meeting2.save()
                })

                it('should succeed on correct data', async () => {

                    await logic.unAttendMeeting(user2.id, meeting1.id)

                    const meeting = await Meeting.findById(meeting1.id)

                    expect(meeting.attending.length).to.equal(0)
                })
                it('should fail on undefined user id', () => {
                    expect(() => logic.unAttendMeeting(undefined, meeting1.id).to.throw(TypeError, 'undefined is not a string'))
                })
                it('should fail on undefined user id', () => {
                    expect(() => logic.unAttendMeeting(user2.id, undefined).to.throw(TypeError, 'undefined is not a string'))
                })

                it('should fail on blank user id', () => {
                    expect(() => logic.unAttendMeeting('', meeting1.id).to.throw(TypeError, 'id is empty or blank'))
                })
                it('should fail on blank meeting', () => {
                    expect(() => logic.unAttendMeeting(user2.id, '').to.throw(TypeError, 'meetingId is empty o rblank'))
                })
                it('should fail on empty user id', () => {
                    expect(() => logic.unAttendMeeting('      \n', meeting1.id).to.throw(TypeError, 'id is empty or blank'))
                })
                it('should fail on blank meeting id', () => {
                    expect(() => logic.unAttendMeeting(user2.id, '      \n').to.throw(TypeError, 'meetingId is empty o rblank'))
                })

            })
            // TODO other test cases
        })

        describe('list upcoming meetings for a user ', () => {
            let user, user2, project, project2, meeting1, meeting2, meeting3, meeting4, meeting5

            beforeEach(async () => {

                user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '1232' })

                user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                project = new Project({ name: 'test12', description: 'testdescription12', skills: ['react12', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })

                project2 = new Project({ name: 'test12', description: 'testdescription12', skills: ['react12', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id })

                meeting1 = new Meeting({ project: project.id, date: new Date('2018-12-01T14:26:31.000Z'), location: 'barcelona', attending: [user2.id] })
                meeting2 = new Meeting({ project: project.id, date: new Date('2018-12-01T14:32:30.000Z'), location: 'madrid', attending: [user.id] })
                meeting3 = new Meeting({ project: project.id, date: new Date('2017-12-01T14:32:30.000Z'), location: 'bilbao', attending: [user2.id] })
                meeting4 = new Meeting({ project: project2.id, date: new Date('2018-11-01T14:32:30.000Z'), location: 'bilbao', attending: [user2.id] })
                meeting5 = new Meeting({ project: project2.id, date: new Date('2018-10-01T14:32:30.000Z'), location: 'bilbao', attending: [user.id] })

                await user.save()
                await user2.save()
                await project.save()
                await project2.save()
                await meeting1.save()
                await meeting2.save()
                await meeting3.save()
                await meeting4.save()
                await meeting5.save()
            })

            it('should succeed on correct data', async () => {

                const meetings = await logic.userUpcomingMeetings(user2.id)

                expect(meetings.length).to.equal(3)

                const [_meeting1, _meeting2] = meetings

                expect(_meeting1.location).to.equal('bilbao')
                expect(_meeting2.location).to.equal('bilbao')

            })
            it('should fail on undefined user id', () => {
                expect(() => logic.attendMeeting(undefined).to.throw(TypeError, 'undefined is not a string'))
            })
            it('should fail on blank user id', () => {
                expect(() => logic.attendMeeting('').to.throw(TypeError, 'id is empty or blank'))
            })
            it('should fail on empty user id', () => {
                expect(() => logic.attendMeeting('       \n').to.throw(TypeError, 'id is empty or blank'))
            })
        })
        false && describe('photo ', () => {
            let user, user2, project, project2, meeting1, meeting2, meeting3

            beforeEach(async () => {

                user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '1232' })

                await user.save()
            })

            it('should succeed on correct data', async () => {

                let image = './images/profile-placeholder.jpg'

                var file = fs.createReadStream(image)


                await logic.insertProfileImage(user.id, file)

                const _user = await User.findById(user.id)

                expect(_user.profileImage).not.to.equal('https://eadb.org/wp-content/uploads/2015/08/profile-placeholder.jpg')

            })

            it('should succeed on correct data', async () => {
                const project = new Project({ name: 'test12', description: 'testdescription12', skills: ['react12', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })

                await project.save()

                let image = './images/profile-placeholder.jpg'

                var file = fs.createReadStream(image)

                await logic.insertProjectImage(file, project.id)

                const _project = await User.findById(project.id)

                expect(_project.insertProfileImage).not.to.equal('https://eadb.org/wp-content/uploads/2015/08/profile-placeholder.jpg')

            })

        })
    })

    describe('chat', () => {

        beforeEach(async () => {


        })



        describe('send messages', () => {
            let user1, user2, conversation1, conversation2

            beforeEach(async () => {
                user1 = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '1232' })

                user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                conversation1 = new Conversation({ members: [user1.id, user2.id], created: Date.now() })

                await user1.save()
                await user2.save()
                await conversation1.save()
            })

            it('should send messages', async () => {
                const text = 'hola mundo'

                await logic.sendMessage(user1.id, user2.id, text)

                const conversations = await Conversation.find()

                const [_conversation] = conversations
                expect(_conversation.messages[0].text).to.equal('hola mundo')
                expect(_conversation.id).to.equal(conversation1.id)
                expect(_conversation.members.length).to.equal(2)
            })

            it('should fail if user1 not found', async () => {
                try {

                    await logic.sendMessage(user1.id, '5c07dae85729ae63c68447ba', 'hola')

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(NotFoundError)
                    expect(err.message).to.equal(`could not find either of the users`)
                }

            })

            it('should fail if user2 not found', async () => {
                try {

                    await logic.sendMessage('5c07dae85729ae63c68447ba', user2.id, 'hola')

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(NotFoundError)
                    expect(err.message).to.equal(`could not find either of the users`)
                }

            })

            it('should fail on undefined user id', () => {
                expect(() => logic.sendMessage(undefined, user2.id, 'hola').to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on null user id', () => {
                expect(() => logic.sendMessage(null, user2.id, 'hola').to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on boolean user id', () => {
                expect(() => logic.sendMessage(true, user2.id, 'hola').to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on numeric user id', () => {
                expect(() => logic.sendMessage(7, user2.id, 'hola').to.throw(TypeError, 'undefined is not a string'))
            })


            it('should fail on numeric user2 id', () => {
                expect(() => logic.sendMessage(user1.id, 7, 'hola').to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on boolean user2 id', () => {
                expect(() => logic.sendMessage(user1.id, true, 'hola').to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on null user2 id', () => {
                expect(() => logic.sendMessage(user1.id, null, 'hola').to.throw(TypeError, 'undefined is not a string'))
            })

            it('should fail on undefined user2 id', () => {
                expect(() => logic.sendMessage(user1.id, undefined, 'hola').to.throw(TypeError, 'undefined is not a string'))
            })




        })

        describe('list messages', () => {
            let user1, user2, user3, conversation1, message1, message2

            beforeEach(async () => {
                user1 = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '1232' })

                user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                user3 = new User({ name: 'John3', email: 'doe3@gmail.com', username: 'jd3', password: '1332' })

                await user1.save()
                await user2.save()
                await user3.save()

            })

            it('should list messages', async () => {
                await logic.sendMessage(user1.id, user2.id, 'hola mundo soy user1')
                await logic.sendMessage(user1.id, user2.id, 'hola mundo soy user1 message2')
                await logic.sendMessage(user1.id, user2.id, 'hola mundo soy user1 message3')

                const messages1 = await logic.listMessages(user1.id, user2.id)

                expect(messages1.messages[0].status).to.equal('pending')
                expect(messages1.messages[1].status).to.equal('pending')
                expect(messages1.messages[2].status).to.equal('pending')

                const messages2 = await logic.listMessages(user2.id, user2.id)
                expect(messages2.messages[0].status).to.equal('read')
                expect(messages2.messages[1].status).to.equal('read')
                expect(messages2.messages[2].status).to.equal('read')

                await logic.sendMessage(user2.id, user1.id, 'hola mundo soy user2')
                await logic.sendMessage(user2.id, user1.id, 'hola mundo soy user2 message 2')

                const messages3 = await logic.listMessages(user2.id, user1.id)
                expect(messages3.messages[3].status).to.equal('pending')
                expect(messages3.messages[4].status).to.equal('pending')


                const messages4 = await logic.listMessages(user1.id, user2.id)

                expect(messages4.messages[3].status).to.equal('read')
                expect(messages4.messages[4].status).to.equal('read')



            })

            it('should fail if user1 not found', async () => {
                try {

                    await logic.listMessages(user1.id, '5c07dae85729ae63c68447ba')

                    expect(true).to.be.false
                } catch (err) {

                    expect(err).to.be.instanceof(NotFoundError)
                    expect(err.message).to.equal(`could not find user with id 5c07dae85729ae63c68447ba`)
                }

            })




        })

        describe('list existing conversations', () => {
            let user1, user2, user3, conversation1, conversation2, message1, message2

            beforeEach(async () => {
                user1 = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '1232' })

                user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                user3 = new User({ name: 'John3', email: 'doe3@gmail.com', username: 'jd3', password: '1332' })

                message1 = { sender: user1.id, text: 'hola mundo' }
                message2 = { sender: user2.id, text: 'hola mundo2' }

                conversation1 = new Conversation({ members: [user1.id, user2.id], messages: [message1, message2] })
                conversation2 = new Conversation({ members: [user1.id, user3.id], messages: [message1, message1] })

                await user1.save()
                await user2.save()
                await user3.save()
                await conversation1.save()
                await conversation2.save()

            })

            it('should list conversations', async () => {

                const conversations = await logic.listConversations(user1.id)
                expect(conversations.length).to.equal(2)
                const [_conversation1, _conversation2] = conversations
                expect(_conversation1.id).to.equal(conversation1.id.toString())
                expect(_conversation2.id).to.equal(conversation2.id.toString())
                expect(_conversation1.messages.length).to.equal(2)
                expect(_conversation2.messages.length).to.equal(2)


            })


        })

        describe('Find conversations', () => {
            let user1, user2, user3, conversation1, conversation2, message1, message2

            beforeEach(async () => {
                user1 = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '1232' })

                user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                user3 = new User({ name: 'John3', email: 'doe3@gmail.com', username: 'jd3', password: '1332' })

                message1 = { sender: user1.id, text: 'hola mundo' }
                message2 = { sender: user2.id, text: 'hola mundo2' }

                conversation1 = new Conversation({ members: [user1.id, user2.id], messages: [message1, message2] })
                conversation2 = new Conversation({ members: [user1.id, user3.id], messages: [message1, message1] })

                await user1.save()
                await user2.save()
                await user3.save()
                await conversation1.save()
                await conversation2.save()

            })

            it('should should find an existing conversation', async () => {

                const conversation = await logic.findConversation(user1.id, user2.id)

                expect(conversation.id).to.equal(conversation1.id.toString())


            })


            it('should should return false if no conversation is found', async () => {

                const conversation = await logic.findConversation(user3.id, user2.id)

                expect(conversation).to.equal(false)


            })


        })



    })

    afterEach(() => Promise.all([User.deleteMany(), Project.deleteMany(), Meeting.deleteMany(), Conversation.deleteMany()]))

    after(() => mongoose.disconnect())
})