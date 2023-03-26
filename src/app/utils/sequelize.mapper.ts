import { Sequelize, Op } from 'sequelize';
export default class SequelizeMapper {
    /**
     *
     * @param arg
     * @returns
	 *From client side we can not send instance. But for sequelize we need to pass many sequelize object like Sequelize.fn, 
	 *Sequelize.where etc. 
	 *So, the purpose of below method is to handle this problem.
	 *This method is basically used to convert user defined filter or projection data of specific pattern into sequelize pattern.
	 *So, in order to use this method, anyone must know what exact pattern of filter and projection passed from client side
	 * to get the required result.
	 *Below are few keywords, to map to sequelize objects
	 * $col --------> Sequelize.col
	 * $literal ----> Sequelize.literal
	 * $fn ---------> Sequelize.fn
	 * $where ------> Sequelize.where
	 * $op ---------> Sequelize.Op  or Op
	 * $match ------> Its a optional functionality, which can be used as a base condition in recursive iteration to stop
	 *  further recursive calls. 

	 * Pattern-----
	 * 1. $col, $literal, $fn, $where, $op will take array as value.
	 * 2. The length of array in case of $col, $literal, $fn, and $where must be equal to number of parameters in Sequelize.col, 
	 *    Sequelize.literal, Sequelize.fn, and  Sequelize.where respectively.
	 * 3. Ith item in above array will be used to map Ith argument in corresponding sequelize method.
	 * Ex-  Seqelize.col('col_name') = {$col:['col_name']}
	 *      Sequelize.literal('string') = {$literal:['string']}
	 *      Sequelize.fn('function_name', Sequelize.col('col_name')) = {$fn:['fn',{$col:['col_name']}]}
	 *      Sequelize.fn('function_name', Sequelize.literal('string')) = {$fn:['fn',{$literal:['string']}]}
	 *      {$operator_name: value} = {$op:['operator_name', value]} ex- {$like: '%substring%'} = {$op:['like', '%substring%']}
	 *      Sequelize.where(Sequelize.fn('function_name', Sequelize.col('col_name')), {$operator_name: value}) = {$where:[{$fn:['fn',{$col:['col_name']}]}, {$op:['operator_name', value]}]}
	 * 4. It can also handle function inside function or any number of recursive functions, not only function anything inside anything(also called nesting),
	 *     any number of times can also be handled, by just following pattern given in 3rd point.


	 *PS: this method can be used to fire any kind of query, either any function, any clause, sub query,... anything.... of database which uses
	 * Sequelize.fn, Sequelize.col, Sequelize.literal, Sequelize.where, or any kind of operator.
     */
    static async map(arg: any): Promise<any> {
        if (typeof arg == 'object') {
            if (arg == null) {
                return arg;
            } else if (arg.hasOwnProperty('$col')) {
                /**{$col:['col_name']} */
                return Sequelize.col(arg.$col[0]);
            } else if (arg.hasOwnProperty('$literal')) {
                return Sequelize.literal(arg.$literal[0]);
            } else if (arg.hasOwnProperty('$fn')) {
                /**{$fn:['fn',{$col:['col_name']}]} */
                return Sequelize.fn(arg.$fn[0], await this.map(arg.$fn[1]));
            } else if (arg.hasOwnProperty('$where')) {
                /**{$where:[{$fn:['fn',{$col:['col_name']}]}]} */
                if (arg.$where.length == 2) {
                    return Sequelize.where(
                        await this.map(arg.$where[0]),
                        await this.map(arg.$where[1])
                    );
                } else if (arg.$where.length == 3) {
                    return Sequelize.where(
                        await this.map(arg.$where[0]),
                        await this.map(arg.$where[1]),
                        await this.map(arg.$where[2])
                    );
                }
            } else if (arg.hasOwnProperty('$op')) {
                /**{$op:[operator, value]} */
                return {
                    [Op[arg.$op[0]]]: await this.map(arg.$op[1])
                };
            } else if (arg.hasOwnProperty('$match')) {
                /**{$match:any object that should return as it is} */
                return arg.$match;
            } else {
                if (Array.isArray(arg)) {
                    if (arg.length > 0 && typeof arg[0] != 'object') {
                        return arg;
                    } else {
                        const res = [];
                        for (let i = 0; i < arg.length; i++) {
                            res.push(await this.map(arg[i]));
                        }
                        return res;
                    }
                } else {
                    const obj = {};
                    for (const key in arg) {
                        obj[key] = await this.map(arg[key]);
                    }
                    return obj;
                }
            }
        } else if (typeof arg == 'string' || typeof arg == 'number') {
            return arg;
        }
    }

    /**
     *
     * @param projection Array<Array<any> | string>
     * @returns Promise<Array<Array<any> | string>>
     * we generally don't call map method directly from API.
     * If want mapping for projection, then call this method i.e. project.
     * Ex- projection = [[{$fn..or $literal...or $col.....or....}, 'alias_name1'],['col_name2'], ['col_name3','alias_name3'],..
     * ...,[{$fn..or $literal...or $col.....or....}, 'alias_name4'],....]
     * return [[corresponding sequelize mapping obj, 'alias_name1'], ['col_name2'], ['col_name3','alias_name3'],...
     *  ..,[corresponding sequelize mapping obj, 'alias_name4'],.....]
     */
    static async project(
        projection: Array<Array<any> | string>
    ): Promise<Array<Array<any> | string>> {
        const result = [];
        for (const element of projection) {
            if (typeof element == 'string') {
                result.push(element);
            } else if (Array.isArray(element) && element.length > 0) {
                const tempResult = await this.map(element[0]);
                if (element.length == 1) {
                    result.push([tempResult]);
                } else if (element.length == 2) {
                    result.push([tempResult, element[1]]);
                }
            }
        }
        return result;
    }

    /**
     *
     * @param filter
     * @returns
     * we generally don't call map method directly from API.
     * If want mapping for filter, then call this method i.e. filter.
     *Ex- filter = {$<and/or>:[{$where:[.............pattern as described in map method.......]},
     * ....,{$<operator1>: value1}, .....,{$<operator2>: value2},.....,
     *  ....,{$where:[.............pattern as described in map method.......]},.......... ]}
     * return-  {$<and/or>:[{corresponding sequelize object},
     *......,{$<operator1>: value1}, .....,{$<operator2>: value2},.....,
     *.......,{corresponding sequelize object},.......... ]}
     */
    static async filter(filter: object): Promise<object> {
        let obj = {};
        for (const key in filter) {
            obj = {
                ...obj,
                ...(await this.map({
                    [key]: filter[key]
                }))
            };
        }
        return obj;
    }
}
/**
API End Point-(/ums/v1/tutors/details)
Query1 - 
SELECT
	`User`.`id` AS `userId`,
	`User`.`name`,
	`User`.`imageUrl`,
	`User`.`type` AS `userType`,
	Concat(`organizationDetails`.`orgCode`, ' : ', `organizationDetails`.`name`) AS `organizationDetails.subName`
FROM
	`users` AS `User`
INNER JOIN `tutors` AS `tutorsDetails` ON
	`User`.`id` = `tutorsDetails`.`userId`
	AND `tutorsDetails`.`premiumStatus` = 1
	AND `tutorsDetails`.`premiumExpiry` > '2020-07-07'
INNER JOIN `organizations` AS `organizationDetails` ON
	`User`.`orgId` = `organizationDetails`.`id`
	AND `organizationDetails`.`buildType` != 5
WHERE
	`User`.`id` NOT IN (1)
	AND `User`.`active` = 1
	AND `User`.`type` = 3
	AND (LOWER(`User`.`name`) LIKE '%hello%'
		OR LOWER(`User`.`mobile`) LIKE '%626030%'
			OR LOWER(`organizationDetails`.`name`) LIKE '%hello%')
LIMIT 5;

payload -
{
	"filter": {
		"user":{"id":{"$notIn":[1]},"active":1,"type": 3},
		"organization":{"buildType":{"$ne":5 }},
		"tutor":{"premiumStatus":1,"premiumExpiry":{"$gt":"2020-07-07"}}
		
	},
	"projection": {
		"user": [["id", "userId"], "name", "imageUrl", ["type", "userType"]],
		"organization":[],
		"tutor":[]
	},
	"options":{"filter":{"user":{"$or":[{"$where":[{"$fn":["LOWER",{"$col":["`User`.`name`"]}]},{"$like":["%hello%" ]}]},{"$where":[{"$fn":["LOWER",{"$col":["`User`.`mobile`"]}]},{"$like":["%626030%"]}]}, {"$where":[{"$fn":["LOWER",{"$col":["`organizationDetails`.`name`"]}]},{"$like":["%hello%"]}]} ]}},
	"projection":{"organization":[[{"$fn":["Concat",{"$literal":["`organizationDetails`.`orgCode`, ' : ', `organizationDetails`.`name`"]}]}, "subName"]]}},
	"limit":5,
	"offset":0
}


Query2-
SELECT
	`id`,
	`username`,
	`orgId`,
	`email`,
	`created`,
	`modified`,
	`dob`,
	`countryExt`,
	`mobile`,
	`isEmailVerified`,
	`type`,
	`signedUp`,
	`active`,
	`name`,
	`imageUrl`,
	`imageUrlBackup`,
	`bio`,
	`promocode`,
	`facebookId`,
	`gender`
FROM
	`users` AS `User`
WHERE
	`User`.`orgId` = 1
	AND `User`.`signedup` = 1
	AND `User`.`type` = 3
	AND (`User`.`created` BETWEEN DATE_FORMAT("2020-07-07 23:59:59", "%Y-%m-%d %H:%i:%s") AND DATE_FORMAT("2021-07-07 23:59:59", "%Y-%m-%d %H:%i:%s"));	

Payload-
{
    "filter": {
        "user":{"orgId":1,"signedup":1,"type": 3}
        
    },
    "projection": {
        "user": {"exclude":[]}
    },
    "options":{"filter":{"user":{"$and":[{"$where":[{"$col":["`User`.`created`"]},{"$between":[{"$fn":["DATE_FORMAT",{"$literal":["\"2020-07-07 23:59:59\",\"%Y-%m-%d %H:%i:%s\""]}]}, {"$fn":["DATE_FORMAT",{"$literal":["\"2021-07-07 23:59:59\",\"%Y-%m-%d %H:%i:%s\""]}]} ]}]}]}}}
}


Query3-
SELECT
	`User`.`mobile`,
	`User`.`signedUp`,
	CASE
		WHEN (`User`.`type` = 3) THEN 'Tutor'
		ELSE 'Student'
	END AS `organizationDetails.type`
FROM
	`users` AS `User`
INNER JOIN `organizations` AS `organizationDetails` ON
	`User`.`orgId` = `organizationDetails`.`id`
	AND `organizationDetails`.`orgCode` = 'diy'
WHERE
	`User`.`orgId` = 1;

Payload- 
{
    "filter": {
        "user":{"orgId":1},
        "organization":{"orgCode" :"diy"}
        
    },
    "projection": {
        "user": ["mobile", "signedUp"],
        "organization":[]
    },
    "options":{"projection":{"organization":[[{"$literal":["CASE WHEN (`User`.`type` = 3) THEN 'Tutor' ELSE 'Student' END"]}, "type"]]}}
}

Query4-
SELECT
	`User`.`name`,
	`tutorsDetails`.`userId` AS `tutorsDetails.userId`
FROM
	`users` AS `User`
INNER JOIN `tutors` AS `tutorsDetails` ON
	`User`.`id` = `tutorsDetails`.`userId`
LEFT OUTER JOIN `caretaker_tutor_map` AS `tutorsDetails->caretakerTutorDetails` ON
	`tutorsDetails`.`id` = `tutorsDetails->caretakerTutorDetails`.`caretakerId`
INNER JOIN `organizations` AS `organizationDetails` ON
	`User`.`orgId` = `organizationDetails`.`id`
INNER JOIN `organization_details` AS `organizationDetails->organizationDetails` ON
	`organizationDetails`.`id` = `organizationDetails->organizationDetails`.`orgId`
WHERE
	(`User`.`id` IN (1, 59, 70)
		OR char_length(`User`.`mobile`) = 12)
	AND `User`.`id` IN (1, 59, 70)
ORDER BY
	`tutorsDetails`.`userId` ASC,
	`User`.`mobile` ASC;

Payload- 
{
    "filter": {
        "user":{"id":[1,59,70]}
        
    },
    "projection": {
        "user": ["name"],
        "tutor":["userId"],
        "caretaker":[],
        "organization":[],
        "organizationDetails":[]
    },
    "options":{"filter":{"user":{"$op":["or",[{"$where":[{"$col":["`User.id`"]},{"$in":[1,59,70]}]}, {"$where":[{"$fn":["char_length",{"$col":["User.mobile"]}]},12]}]] }}},
    "order":[["tutorsDetails","userId","ASC"],["mobile","ASC"]]
}
 */
