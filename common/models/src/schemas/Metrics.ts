export default {
  orgId: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Number,
    required: false,
  },
  // Value
  lifeTimeValue: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateValue: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeValueRefunded: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateValueRefunded: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeValueComped: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateValueComped: {
    type: Number,
    required: false,
    default: 0,
  },
  // Tickets
  lifeTimeTicketsPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateTicketsPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeTicketsRefunded: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateTicketsRefunded: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeTicketsComped: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateTicketsComped: {
    type: Number,
    required: false,
    default: 0,
  },
  // Upgrades
  lifeTimeUpgradesPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateUpgradesPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeUpgradesRefunded: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateUpgradesRefunded: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeUpgradesComped: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateUpgradesComped: {
    type: Number,
    required: false,
    default: 0,
  },
  // Orders
  lifeTimeOrdersPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateOrdersPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeOrdersRefunded: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateOrdersRefunded: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeOrdersComped: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateOrdersComped: {
    type: Number,
    required: false,
    default: 0,
  },
  eventIds: [{
    type: String,
    required: false,
    default: [],
  }]

};