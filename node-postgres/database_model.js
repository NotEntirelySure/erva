const images_model = require("./images_model");
const jwt = require("jsonwebtoken");
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'superuser',
  host: 'localhost',
  database: 'erva',
  password: 'root',
  port: 5432,
});

const getOffices = (token, secret) => {
  return new Promise(function(resolve, reject) {
    if(!token) {reject({"errorCode":401, "error":"No JWT provided"})}
    if (token) {
      jwt.verify(token, secret, async(err, result) => {
        if(err) {reject({"errorCode":401, "error":err});}
        if(result) {
          const userOffices = await pool.query(`
            SELECT DISTINCT
              o.offices_id,
              o.offices_name,
              o.offices_address,
              o.offices_city,
              o.offices_state,
              o.offices_zip 
            FROM offices AS o
            INNER JOIN facilitypermissions AS fp
            ON fp.fp_fk_office=o.offices_id 
            WHERE fp.fp_fk_user=${result.id};
          `);
          let officesArray = []
          console.log(userOffices.rows.length)
          if (userOffices.rows.length > 0) {
            for (let i=0;i<userOffices.rows.length;i++) {
              officesArray.push({
                "id":userOffices.rows[i].offices_id,
                "name":userOffices.rows[i].offices_name,
                "address":userOffices.rows[i].offices_address,
                "city":userOffices.rows[i].offices_city,
                "state":userOffices.rows[i].offices_state,
                "zip":userOffices.rows[i].offices_zip
              })
            }
          }
          resolve(officesArray);
        }
      });
    }
  }) 
}

const getFacilities = (token, secret, officeId) => {
  return new Promise(function(resolve, reject) {
    if(!token) {reject({"errorCode":401, "error":"No JWT provided"})}
    if (token) {
      jwt.verify(token, secret, async(err, result) => {
        if(err) {reject({"errorCode":401, "error":err});}
        if(result) {
          const userFacilities = await pool.query(`
            SELECT DISTINCT
              f.facilities_id,
              f.facilities_name,
              f.facilities_address,
              f.facilities_city,
              f.facilities_state,
              f.facilities_zip,
              f.facilities_image
            FROM facilities AS f
            INNER JOIN facilitypermissions AS fp
            ON fp.fp_fk_facility=f.facilities_id
            WHERE fp.fp_fk_user=${result.id}
            AND fp.fp_fk_office=${officeId};
          `);
          let facilitiesArray = [];
          if (userFacilities.rows.length > 0) {
            for (let i=0;i<userFacilities.rows.length;i++) {
              const image = images_model.getImage("facilities", userFacilities.rows[i].facilities_image)
              facilitiesArray.push({
                "id":userFacilities.rows[i].facilities_id,
                "name":userFacilities.rows[i].facilities_name,
                "address":userFacilities.rows[i].facilities_address,
                "city":userFacilities.rows[i].facilities_city,
                "state":userFacilities.rows[i].facilities_state,
                "zip":userFacilities.rows[i].facilities_zip,
                "image":image
              })
            }
          }
          resolve(facilitiesArray);
        };
      });
    };
  });
};

const getFacilityMaps = (token, secret, facilityId) => {
  
  return new Promise(function(resolve, reject) {
    if(!token) {reject({"errorCode":401, "error":"No JWT provided"})}
    if (token) {
      jwt.verify(token, secret, async(err, result) => {
        if(err) {reject({"errorCode":401, "error":err});}
        if(result) {
          const userMaps = await pool.query(`
            SELECT 
              maps_name,
              maps_code,
              maps_image
            FROM maps
            INNER JOIN facilitypermissions AS fp
            ON fp.fp_fk_facility=maps.maps_fk_facility_id
            WHERE fp.fp_fk_user=${result.id}
            AND maps_fk_facility_id=${facilityId};
          `);
          let mapsArray = [];
          if (userMaps.rows.length > 0) {
            for (let i=0;i<userMaps.rows.length;i++) {
              const image = images_model.getImage("maps", userMaps.rows[i].maps_image)
              mapsArray.push({
                "id":userMaps.rows[i].maps_id,
                "name":userMaps.rows[i].maps_name,
                "code":userMaps.rows[i].maps_code,
                "image":image
              })
            }
          }
          resolve(mapsArray);
        }
      })
    }
  })

}

const getMap = () => {}

module.exports = {
  getOffices,
  getFacilities,
  getFacilityMaps,
  getMap
}