import {
	DataTypes,
	ForeignKey,
	InferAttributes,
	InferCreationAttributes,
	Model,
	Sequelize
} from "sequelize"
const sequelize = new Sequelize({
	logging: false,
	dialect: "sqlite",
	storage: "database.sqlite"
})

export class Giveaway extends Model<
	InferAttributes<Giveaway>,
	InferCreationAttributes<Giveaway>
> {
	declare uuid: string
	declare userId: string
	declare guildId: string
	declare channelId: string
	declare item: string
	declare winners: number
	declare endDate: number
	declare requirements: string
	declare messageId: string
	declare isFinished: boolean
}
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

class Entrant extends Model<
	InferAttributes<Entrant>,
	InferCreationAttributes<Entrant>
> {
	declare uuid: string
	declare userId: string
	declare giveawayUuid: ForeignKey<Giveaway["uuid"]>
}
Entrant.init(
	{
		uuid: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
			unique: true
		},
		userId: DataTypes.STRING,
		giveawayUuid: DataTypes.UUID
	},
	{ sequelize, modelName: "entrant" }
)
class GuildPref extends Model<
	InferAttributes<GuildPref>,
	InferCreationAttributes<GuildPref>
> {
	declare guildId: string
	declare giveawayChannelId: string
	declare extraGiveawayMessage: string
	declare DMUsers: boolean
}
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
