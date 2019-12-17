const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1/perfData', { useUnifiedTopology: true, useNewUrlParser: true })
const Machine = require('./models/Machine')

function socketMain(io, socket) {
    let macA;
    console.log('A socket connected', socket.id)
    socket.on('clientAuth', (key) => {
        if (key === 'dskljlksjd') {
            //valid node cliente has joined
            socket.join('clients')
        } else if (key === 'sdadscad') {
            //valid ui client has joined
            socket.join('ui')
            console.log('A react client has joined')
            Machine.find({}, (err, docs) => {
                docs.forEach((aMachine) => {
                    aMachine.isActive = false;
                    io.to('ui').emit('data', aMachine)
                })
            })
        } else {
            //invalid client has joined
            socket.disconnect(true)
        }
    })

    socket.on('disconnect', () => {
        Machine.find({macA: macA}, (err, docs) => {
            if(docs.length > 0) {
                docs[0].isActive = false
                io.to('ui').emit('data', docs[0])
            }
        })
    })

    socket.on('initPerfData', async (data) => {
        macA = data.macA
        const mongooseResponse = await checkAndAdd(data)
        console.log('Mongoose response -> ', mongooseResponse)
    })

    socket.on('perfData', data => {
        console.log('Tick...')
        io.to('ui').emit('data', data)
    })
}

function checkAndAdd(data) {
    return new Promise((resolve, reject) => {
        Machine.findOne(
            { macA: data.macA },
            (err, doc) => {
                if (err) {
                    throw err;
                    reject(err);
                } else if (doc === null) {
                    let newMachine = new Machine(data);
                    newMachine.save()
                    resolve('added')
                } else {
                    resolve('found')
                }
            }
        )
    })
}

module.exports = socketMain

