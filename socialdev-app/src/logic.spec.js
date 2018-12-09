const logic = require('./logic.js')
const { expect } = require('chai')
require('isomorphic-fetch')
const { mongoose, models: { User, Project, Meeting, Conversation } } = require('data')
global.sessionStorage = require('sessionstorage')
logic.url = 'http://localhost:5000/api'
const MONGO_URL = 'mongodb://localhost:27017/socialdev'

describe('logic', () => {
    before(() => mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }))

    beforeEach(() => Promise.all([User.deleteMany(), Project.deleteMany(), Meeting.deleteMany(), Conversation.deleteMany()]))

    describe('users', () => {
        describe('register', () => {
            let name, email, username, password

            beforeEach(() => {
                name = `n-${Math.random()}`
                email = `e-${Math.random()}@gmail.com`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`
            })

            it('should succeed on correct data', async () => {
                const res = await logic.registerUser(name, email, username, password)

                expect(res).to.be.undefined
            })

            it('should fail on repeted username', async () => {
                try {
                    await logic.registerUser(name, email, username, password)
                    // expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(Error)
                    expect(err.message).to.equal(`username ${username} already registered`)
                }

            })
            it('should fail on undefined name', () => {
                expect(() => logic.registerUser(undefined, email, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty name', () => {
                expect(() => logic.registerUser('', email, username, password)).to.throw(Error, 'name is empty or blank')
            })

            it('should fail on blank name', () => {
                expect(() => logic.registerUser('   \t\n', email, username, password)).to.throw(Error, 'name is empty or blank')
            })

            it('should fail on empty email', () => {
                expect(() => logic.registerUser(name, '', username, password)).to.throw(Error, ' is an invalid email')
            })

            it('should fail on blank email', () => {
                expect(() => logic.registerUser(name, '   \t\n', username, password)).to.throw(Error, ' is an invalid email')
            })


            it('should fail on empty username email', () => {
                expect(() => logic.registerUser(name, email, '', password)).to.throw(Error, 'username is empty or blank')
            })
            it('should fail on blank username', () => {
                expect(() => logic.registerUser(name, email, '     ', password)).to.throw(Error, 'username is empty or blank')
            })

            it('should fail on empty username email', () => {
                expect(() => logic.registerUser(name, email, username, '')).to.throw(Error, 'password is empty or blank')
            })
            it('should fail on blank username', () => {
                expect(() => logic.registerUser(name, email, username, '        ')).to.throw(Error, 'password is empty or blank')
            })
        })
        describe('login', () => {
            describe('with existing user', () => {
                let username, password

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    email = `e-${Math.random()}@gmail.com`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    await logic.registerUser(name, email, username, password)
                })

                it('should succeed on correct data', async () => {
                    await logic.authenticate(username, password)

                    expect(true).to.be.true
                })

                it('should fail on undefined username', () => {
                    expect(() => logic.authenticate(undefined, password)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on undefined passowrd', () => {
                    expect(() => logic.authenticate(username, undefined)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on blank username', () => {
                    expect(() => logic.authenticate('', password)).to.throw(Error, 'username is empty or blank')
                })

                it('should fail on blank passowrd', () => {
                    expect(() => logic.authenticate(username, '')).to.throw(Error, 'password is empty or blank')
                })
            })


        })

        describe('logout', () => {
            let name, email, username, password

            beforeEach(async () => {
                name = `n-${Math.random()}`
                email = `e-${Math.random()}@gmail.com`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                await logic.registerUser(name, email, username, password)
                await logic.authenticate(username, password)
            })

            it('should succeed on correct data', async () => {
                const res = await logic.logout()

                expect(res).to.be.undefined
                expect(logic._userId).to.equal(null)
                expect(logic._token).to.equal(null)
            })


        })

        describe('retrieve user', () => {
            describe('with existing user', () => {
                let name, email, username, password

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    email = `e-${Math.random()}@gmail.com`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`
                    await logic.registerUser(name, email, username, password)
                    await logic.authenticate(username, password)
                })

                it('should succeed on correct data', async () => {

                    const user = await logic.retrieveUserProfile()

                    expect(user.id).to.not.be.undefined
                    expect(user.bio).to.not.be.undefined
                    expect(user.githubProfile).to.not.be.undefined
                    expect(user.name).to.equal(name)
                    expect(user.password).to.be.undefined

                })
            })
        })

        describe('update user profile', () => {
            let user

            beforeEach(async () => {
                user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

                await user.save()
                await logic.authenticate(user.username, user.password)

            })

            it('should update on correct data and password', async () => {
                const { id, bio, githubProfile, city } = user

                const newBio = `${bio}-${Math.random()}`
                const newGithubProfile = `${githubProfile}-${Math.random()}`
                const newCity = `${city}-${Math.random()}`
                const newSkills = ['react', 'mongoose', 'javascript']


                const res = await logic.updateProfile(id, newCity, newGithubProfile, newBio, newSkills)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(_user.bio).to.equal(newBio)

                expect(_user.githubProfile).to.equal(newGithubProfile)
                expect(_user.city).to.equal(newCity)
                expect(newSkills.length).to.equal(3)

            })

            it('should fail undefined id', () => {

                expect(() => logic.updateProfile(undefined, 'barcelona', 'github', 'newbio', 'newskills')).to.throw(TypeError, 'undefined is not a string')
            })
            it('should  failundefined bio', () => {
                expect(() => logic.updateProfile(user.id, undefined, 'github', 'newbio', 'newskills')).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail undefined github profile', () => {
                expect(() => logic.updateProfile(user.id, 'barcelona', undefined, 'newbio', 'newskills')).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail undefined city', () => {
                expect(() => logic.updateProfile(user.id, 'barcelona', 'github', undefined, 'newskills')).to.throw(TypeError, 'undefined is not a string')
            })



            it('should update on correct bio (and other fields null)', async () => {
                const { id, bio, githubProfile, city, skills } = user

                const newBio = `${bio}-${Math.random()}`

                const res = await logic.updateProfile(id, null, null, newBio, null)

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

                const res = await logic.updateProfile(id, city, newGithubProfile, null, null)

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

                const res = await logic.updateProfile(id, newCity, githubProfile, bio, null)

                expect(res).to.be.undefined

                const _users = await User.find()

                const [_user] = _users

                expect(_user.city).to.equal(newCity)

                expect(_user.bio).to.equal(bio)
                expect(_user.githubProfile).to.equal(githubProfile)
                expect(JSON.stringify(_user.skills)).to.equal(JSON.stringify(skills))

            })
        })
    })

})

describe('projects', () => {
    describe('add a project', () => {
        let name, email, username, password, description, skills, beginnerFriendly, maxMembers, location

        beforeEach(async () => {
            user = new User({ name: 'pep', email: 'pep@gmail.com', username: 'pep', password: 'pep' })
            await user.save()

            await logic.authenticate(user.username, user.password)
            name = 'test'
            description = 'test'
            skills = ['skill1', 'skill2', 'skill3']
            location = 'barcelona'

        })

        it('should succeed on correct data', async () => {


            await logic.addNewProject('test', 'test', ['skill1', 'skill2', 'skill3'], '8', 'barcelona')

            const projects = await Project.find()

            const [project] = projects

            expect(project.name).to.equal(name)

            expect(project.description).to.equal(description)

            expect(JSON.stringify(project.skills)).to.equal(JSON.stringify(skills))


            expect(project.currentMembers).to.equal(1)



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





    })

    describe('save a project ', () => {
        let user, user2, project

        beforeEach(async () => {

            user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd555', password: '123555' })

            user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123' })

            project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id })

            await user.save()
            await user2.save()
            await project.save()
            await logic.authenticate(user.username, user.password)
        })

        it('should succeed on correct data', async () => {

            await logic.saveProject(project.id)

            const _user = await User.findById(user.id)

            expect(_user.savedProjects.length).to.equal(1)

            expect(_user.savedProjects[0].toString()).to.equal(project.id)


        })

        it('should fail on undefined user id', () => {
            expect(() => logic.saveProject(undefined).to.throw(TypeError, 'undefined is not a string'))
        })
        it('should fail on undefined user id', () => {
            expect(() => logic.saveProject('').to.throw(ValueError, ' is empty or blank'))
        })
        it('should fail on undefined user id', () => {
            expect(() => logic.saveProject('    \n').to.throw(ValueError, ' is empty or blank'))
        })

        it('should succeed on listing saved projects', async () => {
            project2 = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id })
            project3 = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user2.id })

            await project2.save()
            await project3.save()
            const { name, description, skills, beginnerFriendly, maxMembers, owner } = project

            await logic.saveProject(project2.id)
            await logic.saveProject(project3.id)

            const projects = await logic.listSavedProjects()

            expect(projects.length).to.equal(2)

            expect(projects.name).to.equal

        })
    })

    describe('remove a saved a project ', () => {
        let user, user2, project

        beforeEach(async () => {

            user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

            project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })

            user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123', savedProjects: [project.id] })



            await user.save()
            await user2.save()
            await project.save()
            await logic.authenticate(user2.username, user2.password)
        })

        it('should succeed on correct data', async () => {

            await logic.removeSavedProject(project.id)

            const _user = await User.findById(user.id)

            expect(_user.savedProjects.length).to.equal(0)
        })

        it('should fail on undefined user id', () => {
            expect(() => logic.removeSavedProject(undefined).to.throw(TypeError, 'undefined is not a string'))
        })
        it('should fail on undefined user id', () => {
            expect(() => logic.removeSavedProject('').to.throw(ValueError, ' is empty or blank'))
        })
        it('should fail on undefined user id', () => {
            expect(() => logic.removeSavedProject('    \n').to.throw(ValueError, ' is empty or blank'))
        })
    })


    describe('search for projects', () => {

        beforeEach(async () => {
            user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

            await user.save()

            await logic.authenticate(user.username, user.password)

            project = new Project({ name: 'react', description: 'testdescription1', skills: ['react', 'mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Barcelona' })

            project2 = new Project({ name: 'reach', description: 'testdescription2', skills: ['mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Madrid' })

            project3 = new Project({ name: 'mongoose', description: 'testdescription3', skills: ['react', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Barcelona' })

            project4 = new Project({ name: 'rpo', description: 'testdescription4', skills: ['mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Bilbao' })

            project5 = new Project({ name: 'oterea', description: 'testdescription5', skills: ['react', 'mongoose', 'javascript'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, location: 'Barcelona' })

            await project.save()
            await project2.save()
            await project3.save()
            await project4.save()
            await project5.save()

        })

        it('should successfuly query for projects based on a query and filter', async () => {

            const query = 'q=&f=react+javascript&c=Barcelona'

            const projects = await logic.filterProjects(query)

            expect(projects.length).to.equal(3)

            const [_project1, _project2, _project3] = projects
        })

        it('should successfuly filter results based on skills', async () => {

            const query = 'q=&f=javascript'

            const projects = await logic.filterProjects(query)

            expect(projects.length).to.equal(5)

            const [_project1, _project2, _project3] = projects
        })

        it('should fail on undefined query', () => {
            expect(() => logic.filterProjects(undefined, user.id).to.throw(ValueError, 'undefined is not a string'))
        })


        it('should fail on empty query', () => {
            expect(() => logic.filterProjects('', user.id).to.throw(ValueError, ' is empty or blank'))
        })



        it('should fail on blank query', () => {
            expect(() => logic.filterProjects('    \n', user.id).to.throw(ValueError, ' is empty or blank'))
        })

    })

    describe('retrieve project info', () => {
        let user, user2, project

        beforeEach(async () => {

            user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })
            user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123', skills: ['javascript', 'python'] })

            project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user2.id], pendingCollaborators: [user2.id] })

            await user.save()
            await user2.save()
            await project.save()
            await logic.authenticate(user2.username, user2.password)
        })

        it('should retrieve information on correct project ID', async () => {
            const { name, description, skills, beginnerFriendly, maxMembers, owner } = project

            const _project = await logic.retrieveProjectInfo(project.id)


            expect(_project.name).to.equal(name)
            expect(_project.description).to.equal(description)
            expect(JSON.stringify(_project.skills)).to.equal(JSON.stringify(skills))
            expect(_project.beginnerFriendly).to.equal(beginnerFriendly)
            expect(_project.maxMembers).to.equal(maxMembers)
            expect(_project.currentMembers).to.equal(1)

        })

        it('should fail on undefined query', () => {
            expect(() => logic.retrieveProjectInfo(undefined).to.throw(ValueError, 'undefined is not a string'))
        })


        it('should fail on empty query', () => {
            expect(() => logic.retrieveProjectInfo('', user.id).to.throw(ValueError, ' is empty or blank'))
        })



        it('should fail on blank query', () => {
            expect(() => logic.retrieveProjectInfo('    \n', user.id).to.throw(ValueError, ' is empty or blank'))
        })

        describe('retrieve collaborations pending', () => {
            let user, user5, project, project2, project3, project4, user2

            beforeEach(async () => {
                user = new User({ name: 'John12', email: 'doe1241@gmail.com', username: 'jd1241', password: '123' })

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
                await logic.authenticate(user.username, user.password)
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
        })

        describe('Request collaboration', () => {
            let user, user2, project, project38

            beforeEach(async () => {
                Project.deleteMany()
                user = new User({ name: 'John', email: 'doe1241241@gmail.com', username: 'jd124124', password: '123' })

                user2 = new User({ name: 'John2', email: 'doe21241@gmail.com', username: 'jd21241421', password: '123' })

                project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], maxMembers: '5', owner: user.id })

                project38 = new Project({ name: 'testasdf1', description: 'testdescriasdfption1', skills: ['react1', 'mongoose1', 'javascript1'], maxMembers: '4', owner: user.id })

                await user.save()
                await user2.save()
                await project.save()
                await logic.authenticate(user.username, user.password)
            })

            it('should add user2 into pending collaborators list', async () => {
                expect(project.owner.toString()).to.equal(user.id.toString())

                await logic.requestCollaboration(project.id, user2.id)

                const _projects = await Project.find()

                expect(_projects.length).to.equal(2)

                const [_project] = _projects

                expect(_project.pendingCollaborators.length).to.equal(1)



            })

            it('should add collaborators into collaborator array when accepted', async () => {

                const decision = 'accept'

                expect(project.owner.toString()).to.equal(user.id.toString())

                await logic.requestCollaboration(project.id, user2.id)

                await logic.handleCollaboration(project.id, decision, user2.id)

                const _projects = await Project.find()

                const [_project1, _project2] = _projects

                expect(_project2.pendingCollaborators.length).to.equal(0)

                expect(_project2.collaborators.length).to.equal(1)

                expect(_project2.collaborators[0].toString()).to.equal(user2.id)


            })


            it('should fail on undefined user id', () => {
                expect(() => logic.requestCollaboration(undefined, project38.id).to.throw(ValueError, 'undefined is not a string'))
            })

            it('should fail on undefined user id', () => {
                expect(() => logic.requestCollaboration(user2.id, undefined).to.throw(ValueError, 'undefined is not a string'))
            })

            it('should fail on empty user id', () => {
                expect(() => logic.requestCollaboration('', project38.id).to.throw(ValueError, 'userId is empty or blank'))
            })

            it('should fail on empty user id', () => {
                expect(() => logic.requestCollaboration(user2.id, '').to.throw(ValueError, 'projectId is empty or blank'))
            })

            it('should fail on blank user id', () => {
                expect(() => logic.requestCollaboration('    \n', project38.id).to.throw(ValueError, 'userId is empty or blank'))
            })

            it('should fail on blank user id', () => {
                expect(() => logic.requestCollaboration(user2.id, '   \n').to.throw(ValueError, 'projectId is empty or blank'))
            })


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
            await logic.authenticate(user.username, user.password)

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

        it('should fail undefined project id', () => {
            expect(() => logic.deleteProject(user.id, undefined).to.throw(TypeError, 'undefined is not a string'))
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


    })

    describe('leave a project (stop being collaborator)', () => {
        let user, user2, project

        beforeEach(async () => {
            user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })
            user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '123' })
            project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user2.id] })

            await user.save()
            await user2.save()
            await project.save()
            await logic.authenticate(user2.username, user2.password)
        })

        it('should succeed on correct data', async () => {

            await logic.leaveProject(project.id)

            const _project = await Project.findById(project.id)

            expect(_project.collaborators.length).to.equal(0)
        })

        it('should fail on undefined project id', () => {
            expect(() => logic.leaveProject(undefined).to.throw(ValueError, 'undefined is not a string'))
        })

        it('should fail on undefined user id', () => {
            expect(() => logic.leaveProject('').to.throw(ValueError, ' is not a string'))
        })

        it('should fail on empty user id', () => {
            expect(() => logic.leaveProject('       \n').to.throw(ValueError, ' is empty or blank'))
        })

    })

    describe('meetings', () => {
        describe('add a new meeting ', () => {
            let user, project

            beforeEach(async () => {
                user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123' })

                project = new Project({ name: 'test1', description: 'testdescription1', skills: ['react1', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })



                await user.save()
                await project.save()
                await logic.authenticate(user.username, user.password)
            })

            it('should succeed on correct data', async () => {
                const date = new Date('December 17, 2020 03:24:00')

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
        })


        describe('attend meeting ', () => {
            let user, user2, meeting1, meeting2

            beforeEach(async () => {
                user = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '123sdf2' })
                user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                project2 = new Project({ name: 'test12', description: 'testdescription12', skills: ['react12', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user2.id] })

                meeting1 = new Meeting({ project: project.id, date: Date.now(), location: 'barcelona' })

                meeting2 = new Meeting({ project: project.id, date: Date.now(), location: 'madrid' })

                await user2.save()
                await user.save()
                await project2.save()
                await meeting1.save()
                await meeting2.save()

                await logic.authenticate(user.username, user.password)
            })

            it('should succeed on correct data', async () => {

                await logic.attendMeeting(meeting1.id)

                const meeting = await Meeting.findById(meeting1.id)

                expect(meeting.attending.length).to.equal(1)

                expect(meeting.attending[0].toString()).to.equal(user.id)
            })

            it('should fail on undefined meeting id', () => {
                expect(() => logic.attendMeeting(undefined).to.throw(TypeError, 'undefined is not a string'))
            })
            it('should fail on blank meeting id', () => {
                expect(() => logic.attendMeeting('').to.throw(Error, ' is not empty or blank'))
            })

            it('should fail on empty user id', () => {
                expect(() => logic.attendMeeting('     \n').to.throw(Error, 'id is empty or blank'))
            })



            it('should fail on undefined meeting id', () => {
                expect(() => logic.deleteMeeting(undefined).to.throw(TypeError, 'undefined is not a string'))
            })
            it('should fail on blank meeting id', () => {
                expect(() => logic.deleteMeeting('').to.throw(Error, ' is not empty or blank'))
            })

            it('should fail on empty user id', () => {
                expect(() => logic.deleteMeeting('     \n').to.throw(Error, 'id is empty or blank'))
            })


        })

        describe('list upcoming meetings for a user ', () => {
            let user, user2, project, project2, meeting1, meeting2, meeting3

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
                await logic.authenticate(user2.username, user2.password)
            })

            it('should succeed on correct data', async () => {

                const meetings = await logic.userUpcomingMeetings(user2.id)

                expect(meetings.length).to.equal(3)

                const [_meeting1, _meeting2] = meetings

                expect(_meeting1.location).to.equal('bilbao')
                expect(_meeting2.location).to.equal('bilbao')

            })

            it('should fail on undefined user id', () => {
                expect(() => logic.userUpcomingMeetings(undefined).to.throw(TypeError, 'undefined is not a string'))
            })
            it('should fail on blank user id', () => {
                expect(() => logic.userUpcomingMeetings('').to.throw(Error, ' is not empty or blank'))
            })

            it('should fail on empty user id', () => {
                expect(() => logic.userUpcomingMeetings('     \n').to.throw(Error, 'id is empty or blank'))
            })

        })

        describe('list meetings ', () => {
            let user, project2, meeting1, meeting2, meeting3

            beforeEach(async () => {
                user = new User({ name: 'John124', email: 'do124e@gmail.com', username: 'jd124', password: '1212432' })

                project2 = new Project({ name: 'test12', description: 'testdescription12', skills: ['react12', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id })

                meeting1 = new Meeting({ project: project.id, attending: [user.id], date: Date.now(), location: 'barcelona' })

                meeting2 = new Meeting({ project: project.id, date: Date.now(), location: 'madrid' })

                meeting3 = new Meeting({ project: project2.id, date: Date.now(), location: 'bilbao' })




                await user.save()
                await project.save()
                await meeting1.save()
                await meeting2.save()
                await meeting3.save()
                await logic.authenticate(user.username, user.password)
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
                expect(() => logic.listProjectMeetings('').to.throw(Error, ' is not empty or blank'))
            })

            it('should fail on empty project id', () => {
                expect(() => logic.listProjectMeetings('     \n').to.throw(Error, 'id is empty or blank'))
            })

            it('should retrieve information on a specific meeting', async () => {

                const meeting = await logic.retrieveMeetingInfo(meeting1.id)


                expect(meeting.project.toString()).to.equal(project.id)


                expect(meeting.location).to.equal('barcelona')

                expect(typeof meeting.attending[0].id).to.equal('string')


            })

        })

        describe('unattend meeting ', () => {
            let user2, meeting1, meeting2

            beforeEach(async () => {

                user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                project2 = new Project({ name: 'test12', description: 'testdescription12', skills: ['react12', 'mongoose1', 'javascript1'], beginnerFriendly: 'true', maxMembers: '5', owner: user.id, collaborators: [user2.id] })

                meeting1 = new Meeting({ project: project.id, date: Date.now(), location: 'barcelona', attending: [user2.id] })

                meeting2 = new Meeting({ project: project.id, date: Date.now(), location: 'madrid' })

                await user2.save()
                await project2.save()
                await meeting1.save()
                await meeting2.save()

                await logic.authenticate(user2.username, user2.password)
            })

            it('should succeed on correct data', async () => {

                await logic.unAttendMeeting(meeting1.id)

                const meeting = await Meeting.findById(meeting1.id)

                expect(meeting.attending.length).to.equal(0)
            })

            it('should fail on undefined meeting id', () => {
                expect(() => logic.unAttendMeeting(undefined).to.throw(TypeError, 'undefined is not a string'))
            })
            it('should fail on blank meeting id', () => {
                expect(() => logic.unAttendMeeting('').to.throw(Error, ' is not empty or blank'))
            })

            it('should fail on empty meeting id', () => {
                expect(() => logic.unAttendMeeting('     \n').to.throw(Error, 'id is empty or blank'))
            })

        })
    })



    describe('chat', () => {
        describe('send messages', () => {
            let user1, user2, conversation1, conversation2

            beforeEach(async () => {
                user1 = new User({ name: 'John', email: 'doe@gmail.com', username: 'jd', password: '1232' })

                user2 = new User({ name: 'John2', email: 'doe2@gmail.com', username: 'jd2', password: '1232' })

                conversation1 = new Conversation({
                    members: [user1.id, user2.id], created: Date.now()
                })

                await user1.save()
                await user2.save()
                await conversation1.save()
                await logic.authenticate(user1.username, user1.password)
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
                await logic.authenticate(user1.username, user2.password)

            })

            it('should list messages', async () => {
                await logic.sendMessage(user1.id, user2.id, 'hola mundo soy user1')
                await logic.sendMessage(user1.id, user2.id, 'hola mundo soy user1 message2')
                await logic.sendMessage(user1.id, user2.id, 'hola mundo soy user1 message3')

                const messages1 = await logic.listMessages(user1.id, user2.id)

                expect(messages1.messages[0].status).to.equal('pending')
                expect(messages1.messages[1].status).to.equal('pending')
                expect(messages1.messages[2].status).to.equal('pending')
                await logic.authenticate(user2.username, user1.password)

                const messages2 = await logic.listMessages(user2.id, user2.id)
                expect(messages2.messages[0].status).to.equal('read')
                expect(messages2.messages[1].status).to.equal('read')
                expect(messages2.messages[2].status).to.equal('read')

                await logic.sendMessage(user2.id, user1.id, 'hola mundo soy user2')
                await logic.sendMessage(user2.id, user1.id, 'hola mundo soy user2 message 2')

                const messages3 = await logic.listMessages(user2.id, user1.id)
                expect(messages3.messages[3].status).to.equal('pending')
                expect(messages3.messages[4].status).to.equal('pending')

                await logic.authenticate(user1.username, user2.password)
                const messages4 = await logic.listMessages(user1.id, user2.id)

                expect(messages4.messages[3].status).to.equal('read')
                expect(messages4.messages[4].status).to.equal('read')



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
                await logic.authenticate(user1.username, user1.password)

            })

            it('should list conversations', async () => {

                const conversations = await logic.listConversations()
                expect(conversations.length).to.equal(2)
                const [_conversation1, _conversation2] = conversations

                expect(_conversation1[0].username).to.equal('jd2')
                expect(_conversation1[0].id).to.equal(user2.id.toString())
                expect(_conversation2[0].username).to.equal('jd3')
                expect(_conversation2[0].id).to.equal(user3.id.toString())



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

                await logic.authenticate(user1.username, user1.password)
            })

            it('should should find an existing conversation', async () => {

                const conversation = await logic.findConversation(user2.id)

                expect(conversation.id).to.equal(conversation1.id.toString())


            })


            it('should should return false if no conversation is found', async () => {
                await logic.authenticate(user2.username, user2.password)
                const conversation = await logic.findConversation(user3.id)

                expect(conversation).to.equal(false)


            })


        })
    })









    afterEach(() => Promise.all([User.deleteMany(), Project.deleteMany(), Meeting.deleteMany(), Conversation.deleteMany()]))

    after(() => mongoose.disconnect())
})