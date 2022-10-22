const Pool = require('pg').Pool
const pool = new Pool({
  user: 'superuser',
  host: 'localhost',
  database: 'postgres',
  password: 'root',
  port: 5433,
});

const login = (username, password) => {
  return new Promise(function(resolve, reject) {
    pool.query(`SELECT (EXISTS (SELECT FROM administrators WHERE username='${username}' AND password='${password}'))::int;`, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const getProjects = () => {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM Projects', (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const getVotes = (projectID) => {
  let SqlQuery;
  if (projectID === "all"){
    SqlQuery = `
      SELECT 
        votes.voteid,
        votes.voteprojectid,
        votes.voteValue,
        participants.participanttitle,
        participants.participantfname,
        participants.participantlname 
      FROM votes
      INNER JOIN participants
      ON participants.participantid=votes.voteparticipantid;`}
  else {SqlQuery = `SELECT voteparticipantid, votevalue FROM votes WHERE voteprojectid='${projectID}';`}
  return new Promise(function(resolve, reject) { 
    pool.query(SqlQuery, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const getVoterInfo = (voterID) => {
  let SqlQuery;
  if (voterID === "all"){SqlQuery = "SELECT * FROM participants";}
  else {SqlQuery = `SELECT * FROM participants WHERE participantid='${voterID}'`}

  return new Promise(function(resolve, reject) { 
    pool.query(SqlQuery, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results.rows);
    })
  }) 
}

const addProject = (projectID, projectDescription) => {
  return new Promise(function(resolve, reject) {
    pool.query(`INSERT INTO projects (projectid, projectdescription) VALUES ('${projectID}', '${projectDescription}')`, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results);
    })
  }) 
}

const editProject = (previousProjectID, newProjectID, newProjectDescription) => {
  return new Promise(function(resolve, reject) { 
  pool.query(`UPDATE projects SET "ProjectID"='${newProjectID}',"ProjectDescription"='${newProjectDescription}' WHERE "ProjectID"='${previousProjectID}';`, (error, results) => {
    if (error) {
      reject(error)
    }
    resolve(results);
  })
}) 
}

const submitVote = (projectID, voterID, voteValue) => {  
  return new Promise(function(resolve, reject) { 
      pool.query(
        `DO $$ 
            BEGIN 
                PERFORM * FROM votes WHERE voteprojectid='${projectID}' AND voteparticipantid=${voterID};
            
                IF FOUND THEN UPDATE votes SET votevalue='${voteValue}' WHERE voteprojectid='${projectID}' AND voteparticipantid='${voterID}';
                ELSE INSERT INTO votes (voteprojectid, voteparticipantid, votevalue) VALUES ('${projectID}', '${voterID}', '${voteValue}');
                END IF; 
                
            END
        $$;`, (error, results) => {
        if (error) {reject(error)}
        resolve(results);
      })
    }) 
  }

  const registerVoter = (participanttitle, firstName, lastName) => {
    return new Promise(function(resolve, reject) { 
      pool.query(
        `DO $$ 
            BEGIN 
                PERFORM * FROM participants WHERE participanttitle='${participanttitle}' AND participantfname='${firstName}' AND participantlname='${lastName}';
            
                IF NOT FOUND THEN INSERT INTO participants (participanttitle, participantfname, participantlname) VALUES ('${participanttitle}', '${firstName}', '${lastName}');
                END IF;
            END
        $$;
        SELECT participantid FROM participants WHERE participanttitle='${participanttitle}' AND participantfname='${firstName}' AND participantlname='${lastName}';`, (error, results) => {
        if (error) {reject(error)}
        console.log(results)
        resolve(results[1].rows);
      })
    }) 
  }

  const deleteVoter = (voterID) => {
    return new Promise(function(resolve, reject) { 
    pool.query(`DELETE FROM participants WHERE participantid='${voterID}'`, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results);
    })
  }) 
}

const deleteProject = (projectID) => {
  return new Promise(function(resolve, reject) { 
    pool.query(`DELETE FROM projects WHERE "ProjectID"='${projectID}'`, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results);
    })
  })
}

const deleteVote = (voteID) => {
  let SqlQuery;
  if (voteID === "all"){SqlQuery = "DELETE FROM votes";}
  else {SqlQuery = `DELETE FROM votes WHERE voteid='${voteID}';`}
  return new Promise(function(resolve, reject) {
    pool.query(SqlQuery, (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results);
    })
  })
}

module.exports = {
  login,
  getProjects,
  getVotes,
  getVoterInfo,
  addProject,
  editProject,
  submitVote,
  registerVoter,
  deleteVoter,
  deleteProject,
  deleteVote
}