const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, } = require('mongodb');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ulnoerh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const serviceCollection = client.db('event360').collection('services');

        const eventCollection = client.db('event360').collection('events');

        const recentEventCollection = client.db('event360').collection('recentEvents');

        /*****Recent Event Items Section*****/
        //get recent events
        app.get('/api/v1/recents', async (req, res) => {
            const query = {}
            const cursor = recentEventCollection.find(query);
            const recentEvents = await cursor.toArray();

            res.send({
                success: true,
                message: 'Successfully retrieved all recent events',
                data: recentEvents
            })
        })



        /******Event Items Section*****/
        //add a new event
        app.post('/api/v1/events', async (req, res) => {
            try {
                const result = await eventCollection.insertOne(req.body);
                // console.log("result from 33", result);
                if (result.insertedId) {
                    res.send({
                        success: true,
                        message: "Successfully added your event",

                    });
                } else {
                    res.send({
                        success: false,
                        error: "Couldn't add the event"
                    });
                };
            }
            catch (error) {
                console.log(error.name, error.message)
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        });

        //get all events
        app.get('/api/v1/events', async (req, res) => {
            try {
                const query = {};
                const cursor = eventCollection.find(query);
                const allEvents = await cursor.toArray();

                res.send({
                    success: true,
                    message: 'Successfully retrieved all events',
                    data: allEvents
                })

            }
            catch (err) {
                console.log(err.name, err.message);
                res.send(
                    {
                        success: false,
                        error: err.message,
                    }
                )
            }
        })


        /**** Service Section ****/
        //add a service
        app.post('/api/v1/services', async (req, res) => {
            try {
                const result = await serviceCollection.insertOne(req.body);
                // console.log("result from 33", result);
                if (result.insertedId) {
                    res.send({
                        success: true,
                        message: "Successfully added your service",

                    });
                } else {
                    res.send({
                        success: false,
                        error: "Couldn't add the product"
                    });
                };
            }
            catch (error) {
                console.log(error.name, error.message)
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        });

        //update a service
        app.patch('/api/v1/services/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const { _id, ...updatedFields } = req.body; // Exclude _id from the updated fields
                const result = await serviceCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedFields } // Update only the other fields
                );
                if (result.matchedCount) {
                    res.status(200).json({
                        success: true,
                        message: "Service updated successfully",
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        error: "Service not found or couldn't be updated",
                    });
                }
            } catch (error) {
                console.error("Error updating service:", error);
                res.status(500).json({
                    success: false,
                    error: "Internal server error",
                });
            }
        });



        //delete service
        app.delete('/api/v1/services/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await serviceCollection.deleteOne({
                    _id: new ObjectId(id)
                });
                if (result.deletedCount) {
                    res.send({
                        success: true,
                        message: 'Service deleted successfully.'
                    });
                }
                else {
                    res.send({
                        success: false,
                        error: "Couldn't delete the service",
                    });
                }
            }
            catch (error) {
                console.error(error.name, error.message);
                res.send({
                    success: false,
                    error: error.message,
                });
            }
        })

        // get all services
        app.get('/api/v1/services', async (req, res) => {
            try {
                const query = {};
                const cursor = serviceCollection.find(query);
                const allServices = await cursor.toArray();

                res.send({
                    success: true,
                    message: 'Successfully retrieved all services',
                    data: allServices
                })

            }
            catch (err) {
                console.log(err.name, err.message);
                res.send(
                    {
                        success: false,
                        error: err.message,
                    }
                )
            }
        })


        //limit services
        app.get('/api/v1/limit-services', async (req, res) => {
            try {
                const query = {};
                const cursor = serviceCollection.find(query);
                const limitedServices = await cursor.limit(3).toArray();

                res.send({
                    success: true,
                    message: "Limited Services retrieved successfully",
                    data: limitedServices
                });
            } catch (error) {
                console.error(error.name, error.message)
                res.send({
                    success: false,
                    error: error.message,
                })
            }
        })



    } finally {
        console.log("Operation is successful")
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Event 360 server is running')
})

app.listen(port, () => {
    console.log(`Event 360 server is listening on port ${port}`);
})