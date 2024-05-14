const express = require('express');
const mongoose = require('mongoose');

const app = express();

const PORT = 8000;
app.use(express.json());
app.use(cors())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Mongodb is Connected!");
        app.listen(PORT, () => console.log("Server started on the PORT", PORT))
    })
    .catch((error) => {
        console.log("Error", error)
    })

// Define schemas
const mentorSchema = new mongoose.Schema({
    name: String
});

const studentSchema = new mongoose.Schema({
    name: String,
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }
});

const Mentor = mongoose.model('Mentor', mentorSchema);
const Student = mongoose.model('Student', studentSchema);

// API endpoints
// Create Mentor
app.post('/mentors', async (req, res) => {
    try {
        const mentor = await Mentor.create(req.body);
        res.json(mentor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Student
app.post('/students', async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign a student to a Mentor
app.put('/assign/:mentorId/:studentId', async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.mentorId);
        const student = await Student.findByIdAndUpdate(req.params.studentId, { mentor: mentor._id }, { new: true });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Select one mentor and add multiple students
app.put('/mentor/:mentorId/addStudents', async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.mentorId);
        const students = await Promise.all(req.body.students.map(async (studentId) => {
            return await Student.findByIdAndUpdate(studentId, { mentor: mentor._id }, { new: true });
        }));
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Write API to Assign or Change Mentor for particular Student
app.put('/student/:studentId/assignMentor/:mentorId', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.studentId, { mentor: req.params.mentorId }, { new: true });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Select One Student and Assign one Mentor
app.put('/student/:studentId/assignMentor', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { mentorId } = req.body;
        const student = await Student.findByIdAndUpdate(studentId, { mentor: mentorId }, { new: true });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Write API to show all students for a particular mentor
app.get('/mentor/:mentorId/students', async (req, res) => {
    try {
        const students = await Student.find({ mentor: req.params.mentorId });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Write an API to show the previously assigned mentor for a particular student
app.get('/student/:studentId/previousMentor', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        const previousMentor = await Mentor.findById(student.previousMentor);
        res.json(previousMentor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
