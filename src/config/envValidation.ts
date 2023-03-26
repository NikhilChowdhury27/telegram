const { Joi } = require('base-packages');
const envVarsSchema = Joi.object()
    .keys({
        BOT_LISTENER_TOKEN_1: Joi.string().required(),
        BOT_LISTENER_TOKEN_2: Joi.string().required(),
        BOT_LISTENER_TOKEN_3: Joi.string().required()
        // PORT: Joi.number().positive().required()
    })
    .unknown();

const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    bot1: envVars.BOT_LISTENER_TOKEN_1,
    bot2: envVars.BOT_LISTENER_TOKEN_2,
    bot3: envVars.BOT_LISTENER_TOKEN_3
};
