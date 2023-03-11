import { DataTypes, Model, Sequelize } from "sequelize"
const sequelize = new Sequelize({
	logging: false,
	dialect: "sqlite",
	storage: "database.sqlite"
})

class Giveaway extends Model {}
Giveaway.init(
	{
		uuid: {
			type: DataTypes.UUID,
			unique: true,
			primaryKey: true
		},
		userId: DataTypes.STRING,
		guildId: DataTypes.STRING,
		channelId: DataTypes.STRING,
		item: DataTypes.STRING,
		winners: DataTypes.INTEGER,
		endDate: DataTypes.STRING,
		requirements: {
			type: DataTypes.STRING,
			defaultValue: null
		},
		messageId: DataTypes.STRING,
		isFinished: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	},
	{ sequelize, modelName: "giveaway" }
)

class Entrant extends Model {}
Entrant.init(
	{
		uuid: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			unique: true
		},
		userId: DataTypes.STRING,
		giveawayUuid: {
			type: DataTypes.UUID,
			foreignKey: true
		}
	},
	{ sequelize, modelName: "entrant" }
)
class GuildPref extends Model {}
GuildPref.init(
	{
		guildId: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		giveawayChannelId: DataTypes.STRING,
		extraGiveawayMessage: {
			type: DataTypes.STRING,
			defaultValue: null
		},
		DMUsers: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	},
	{ sequelize, modelName: "GuildPref" }
)
Giveaway.hasMany(Entrant)
Entrant.belongsTo(Giveaway)

export const db = {
	GuildPrefs: GuildPref,
	Entrants: Entrant,
	Giveaways: Giveaway,
	Sequelize: sequelize
}
