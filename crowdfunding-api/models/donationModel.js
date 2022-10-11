const mongoose = require('mongoose');
const Project = require('./projectModel');

const donationSchema = new mongoose.Schema({
    
    donor: {
        type: Object,
        required: [true, 'Donation must have a donor (user)'],
        select: false //This property setted as 'false' avoids that password be returned in queries
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: [true, 'Donation must be done to a specific project']
    },
    value: {
        type: Number,
        required: [true, 'Donation must have a value'],
        validator: function(val) {
            return (val > 0);
        }
    },
    serviceTax: {
        type: Number,
        required: [true, 'Donation must have a service tax'],
        validator: function(val) {
            return (val > 0);
        }
    },
    networkTax: {
        type: Number,
        required: [true, 'Donation must have a network tax'],
        validator: function(val) {
            return (val > 0);
        }
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }

});

/* Virtual field to get the donor ID */
donationSchema.virtual('donorId').get(function() {
    return this.donor._id;
})

/* After registering this donation, this function updates
 total donations fields (value and qtd) in the project */
donationSchema.post('save', async function(doc, next) {
    const thisProject = await Project.findById(`${this.project}`);
    const thisProjectDonations = await Donation.find({
        project: `${this.project}`
    });
    await thisProject.updateReceivedDonations(thisProjectDonations);
    next();
})

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;