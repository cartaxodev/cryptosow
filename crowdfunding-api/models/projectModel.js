const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Project must belong to an owner (user)']
    },
    title: {
        type: String,
        required: [true, 'A project must have a name'],
        unique: true,
        minLength: 10,
        maxLength: 50
    },
    description: {
        type: String,
        required: [true, 'A project must have a description'],
        minLength: 10,
        maxLength: 2000
    },
    targetValue: {
        type: Number,
        required: [true, 'A project must have a target value']
    },
    receivedValue: {
        type: Number,
        default: 0
    },
    receivedDonations: {
        type: Number,
        default: 0
    },
    creationDate: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: String,
        enum: ['new', 'active', 'inactive'],
        required: true,
        default: 'new'
    },
    smartContractAddress: {
        type: String,
        unique: true
    },
    ownerEthereumAccount: {
        type: String,
        required: [true, "A project must have an owner's ethereum account (EOA) address"]
        //validade: TODO: Validate if owner's account is a real valid ethereum account.
    }
});

/* Updates the receivedValue and receivedDonations after a new donation be registered*/
projectSchema.methods.updateReceivedDonations = async function(donations) {
   
    let receivedDonations = 0;
    let receivedValue = 0;

    donations.forEach( el => {
        receivedDonations = receivedDonations + 1;
        receivedValue = receivedValue + el.value;
    });

    this.receivedDonations = receivedDonations;
    this.receivedValue = receivedValue;
    await this.save();
}

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;