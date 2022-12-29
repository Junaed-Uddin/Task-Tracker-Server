const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, Collection, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 8000;

//middleware
app.use(cors());
app.use(express.json());

// database setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.t0pnxex.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function dbConnect() {
    try {
        await client.connect();
        console.log('database connected');
    } catch (error) {
        console.log(error.name, error.message)
    }
}

dbConnect();

// Collections
const Tasks = client.db("ManagementAPP").collection("Tasks");

// task post route
app.post('/tasks', async (req, res) => {
    try {
        const task = req.body;
        console.log(task);
        const result = await Tasks.insertOne(task);
        if (result.insertedId) {
            res.send({
                success: true,
                message: `${task.taskName} is successfully tracked`
            })
        }
        else {
            res.send({
                success: false,
                message: `something went wrong. Please try again`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

//all task get route
app.get('/allTasks', async (req, res) => {
    try {
        const query = {};
        const AllTasks = await Tasks.find(query).toArray();
        res.send({
            success: true,
            data: AllTasks
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

// single task 
app.get('/allTasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = { _id: ObjectId(id) };
        const task = await Tasks.findOne(query);
        res.send({
            success: true,
            data: task
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

// delete task 
app.delete('/task/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = { _id: ObjectId(id) };
        const result = await Tasks.deleteOne(query);
        if (result.deletedCount) {
            res.send({
                success: true,
                message: 'Successfully deleted'
            })
        }
        else {
            res.send({
                success: false,
                message: 'Something went wrong. Please try again'
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

// edit task
app.patch('/editTask/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filter = { _id: ObjectId(id) };
        const updateDoc = {
            $set: {
                taskName: req.body.taskName,
                desc: req.body.desc,
                image: req.body.image
            }
        }
        const result = await Tasks.updateOne(filter, updateDoc);
        if (result.matchedCount) {
            res.send({
                success: true,
                message: `${req.body.taskName} is successfully updated`
            })
        }
        else {
            res.send({
                success: false,
                message: `Couldn't update successfully. Please try again`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

// task status
app.put('/taskStatus/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateStatus = {
            $set: {
                status: 'complete'
            }
        }
        const result = await Tasks.updateOne(filter, updateStatus, options);
        if (result.matchedCount) {
            res.send({
                success: true,
                message: 'Task Successfully Completed'
            })
        }
        else {
            res.send({
                success: false,
                message: `Couldn't Successfully completed. Please try again`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

// completed task view
app.get('/completedTask', async (req, res) => {
    try {
        const query = { status: 'complete' };
        const completedTask = await Tasks.find(query).toArray();
        res.send({
            success: true,
            data: completedTask
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
});

// uncompleted task
app.put('/incompleteTask/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateTask = {
            $set: {
                status: 'incomplete'
            }
        }

        const result = await Tasks.updateOne(filter, updateTask, options);
        if (result.matchedCount) {
            res.send({
                success: true,
                message: `Task's status is updated`
            })
        }
        else {
            res.send({
                success: false,
                message: `Couldn't successfully updated. Please try again`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


//route endpoint test
app.get('/', async (req, res) => {
    res.send('Management app server is running')
});

app.listen(port, () => {
    console.log(`Management server is running on ${port}`);
})