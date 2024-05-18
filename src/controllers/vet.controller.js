import { getConnection } from "./../database/database";

//Funcion que actua para el metodo GET.
const getAll = async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.query(`
      SELECT 
        Client.client_id AS id_client,
        Client.full_name AS client_name,
        Client.document_number,
        Client.gender AS client_gender,
        Pet.name AS pet_name,
        Pet.breed AS pet_breed,
        Pet.gender AS pet_gender,
        ClinicalHistory.date_visited AS visit_date,
        ClinicalHistory.time_visited AS visit_time,
        VisitDetail.temperature,
        VisitDetail.weight,
        VisitDetail.heart_rate,
        VisitDetail.visit_date AS detail_visit_date,
        VisitDetail.visit_time AS detail_visit_time,
        VisitDetail.observation,
        Collaborator.full_name AS collaborator_name
      FROM 
        ClinicalHistory
      JOIN 
        Pet ON ClinicalHistory.pet_id = Pet.pet_id
      JOIN 
        Client ON Pet.client_id = Client.client_id
      JOIN 
        VisitDetail ON ClinicalHistory.history_id = VisitDetail.history_id
      LEFT JOIN 
        Collaborator ON VisitDetail.collaborator_id = Collaborator.collaborator_id`);

    res.json(result);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

//Funcion que actua para el metodo GET.
const getAllId = async (req, res) => {
  try {
    console.log(req.params);
    const { history_id } = req.params;
    const connection = await getConnection();
    const result = await connection.query(
                `SELECT 
                Client.client_id AS id_client,
                Client.full_name AS client_name,
                Client.document_number,
                Client.gender AS client_gender,
                Pet.name AS pet_name,
                Pet.breed AS pet_breed,
                Pet.gender AS pet_gender,
                ClinicalHistory.date_visited AS visit_date,
                ClinicalHistory.time_visited AS visit_time,
                VisitDetail.temperature,
                VisitDetail.weight,
                VisitDetail.heart_rate,
                VisitDetail.visit_date AS detail_visit_date,
                VisitDetail.visit_time AS detail_visit_time,
                VisitDetail.observation,
                Collaborator.full_name AS collaborator_name
            FROM 
                ClinicalHistory
            JOIN 
                Pet ON ClinicalHistory.pet_id = Pet.pet_id
            JOIN 
                Client ON Pet.client_id = Client.client_id
            JOIN 
                VisitDetail ON ClinicalHistory.history_id = VisitDetail.history_id
            LEFT JOIN 
                Collaborator ON VisitDetail.collaborator_id = Collaborator.collaborator_id
            WHERE ClinicalHistory.history_id = ?`,  history_id
    );

    res.json(result);
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

// Funcion que actua para el metodo POST.
const addVet = async (req, res) => {
  try {
    const {
      client_name,
      document_number,
      client_gender,
      pet_name,
      pet_breed,
      pet_gender,
      visit_date,
      visit_time,
      temperature,
      weight,
      heart_rate,
      detail_visit_date,
      detail_visit_time,
      observation,
      collaborator_name,
    } = req.body;

    if (
      client_name === undefined ||
      document_number === undefined ||
      client_gender === undefined ||
      pet_name === undefined ||
      pet_breed === undefined ||
      pet_gender === undefined ||
      visit_date === undefined ||
      visit_time === undefined ||
      temperature === undefined ||
      weight === undefined ||
      heart_rate === undefined ||
      detail_visit_date === undefined ||
      detail_visit_time === undefined ||
      observation === undefined ||
      collaborator_name === undefined
    ) {
      res.status(400).json({ message: "Bad Request" });
    }

    const connection = await getConnection();

    // Insert into client
    const clientResult = await connection.query(
      `INSERT INTO client (full_name, document_number, gender) VALUES (?, ?, ?)`,
      [client_name, document_number, client_gender]
    );
    const client_id = clientResult.insertId;

    // Insert into pet
    const petResult = await connection.query(
      `INSERT INTO pet (name, breed, gender, client_id) VALUES (?, ?, ?, ?)`,
      [pet_name, pet_breed, pet_gender, client_id]
    );
    const pet_id = petResult.insertId;

    // Insert into clinicalhistory
    const clinicalHistoryResult = await connection.query(
      `INSERT INTO clinicalhistory (pet_id, date_visited, time_visited) VALUES (?, ?, ?)`,
      [pet_id, visit_date, visit_time]
    );
    const history_id = clinicalHistoryResult.insertId;

    // Check if collaborator exists
    let collaborator_id;
    const collaboratorResult = await connection.query(
      `SELECT collaborator_id FROM collaborator WHERE full_name = ?`,
      [collaborator_name]
    );

    if (collaboratorResult.length > 0) {
      collaborator_id = collaboratorResult[0].collaborator_id;
    } else {
      const newCollaboratorResult = await connection.query(
        `INSERT INTO collaborator (full_name) VALUES (?)`,
        [collaborator_name]
      );
      collaborator_id = newCollaboratorResult.insertId;
    }

    // Insert into visitdetail
    await connection.query(
      `INSERT INTO visitdetail (history_id, temperature, weight, heart_rate, visit_date, visit_time, observation, collaborator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        history_id,
        temperature,
        weight,
        heart_rate,
        detail_visit_date,
        detail_visit_time,
        observation,
        collaborator_id,
      ]
    );

    res.status(201).send({ message: "Visit added successfully" });
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

// Funcion que actua ante la peticion PUT. 
const updateVet = async (req, res) => {
  try {
    const { history_id } = req.params;

    const {
      client_name,
      document_number,
      client_gender,
      pet_name,
      pet_breed,
      pet_gender,
      visit_date,
      visit_time,
      temperature,
      weight,
      heart_rate,
      detail_visit_date,
      detail_visit_time,
      observation,
      collaborator_name,
    } = req.body;

    // Validar si hay campos indefinidos en req.params y req.body
    if (
      history_id === undefined ||
      client_name === undefined ||
      document_number === undefined ||
      client_gender === undefined ||
      pet_name === undefined ||
      pet_breed === undefined ||
      pet_gender === undefined ||
      visit_date === undefined ||
      visit_time === undefined ||
      temperature === undefined ||
      weight === undefined ||
      heart_rate === undefined ||
      detail_visit_date === undefined ||
      detail_visit_time === undefined ||
      observation === undefined ||
      collaborator_name === undefined
    ) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const connection = await getConnection();

      // Actualizar datos del cliente
      await connection.query(
          `UPDATE Client
          SET full_name = ?, document_number = ?, gender = ?
          WHERE client_id = (
            SELECT client_id FROM Pet WHERE pet_id = (
              SELECT pet_id FROM ClinicalHistory WHERE history_id = ?
            )
          )`,
          [client_name, document_number, client_gender, history_id]
        );
    
        // Actualizar datos de la mascota
        await connection.query(
          `UPDATE Pet
          SET name = ?, breed = ?, gender = ?
          WHERE pet_id = (
            SELECT pet_id FROM ClinicalHistory WHERE history_id = ?
          )`,
          [pet_name, pet_breed, pet_gender, history_id]
        );
    
        // Actualizar datos de la historia clínica
        await connection.query(
          `UPDATE ClinicalHistory
          SET date_visited = ?, time_visited = ?
          WHERE history_id = ?`,
          [visit_date, visit_time, history_id]
        );
    
        // Actualizar datos del detalle de visita
        await connection.query(
          `UPDATE VisitDetail
          SET temperature = ?, weight = ?, heart_rate = ?,
          visit_date = ?, visit_time = ?, observation = ?
          WHERE history_id = ?`,
          [temperature, weight, heart_rate, detail_visit_date, detail_visit_time, observation, history_id]
        );

    res.json({ message: "Update successful" });
  } catch (error) {
    res.status(500);
    res.send(error.message);
    }
};


//Funcion que actua para el metodo DELETE
const deleteVet = async (req, res) => {
  try {
    const { history_id } = req.params;
    const connection = await getConnection();

    // Eliminar las filas relacionadas en la tabla VisitDetail
    await connection.query(
      `DELETE FROM VisitDetail WHERE history_id = ?`, history_id
    );

    // Luego eliminar la fila en la tabla ClinicalHistory
    const result = await connection.query(
      `DELETE FROM ClinicalHistory WHERE history_id = ?`, history_id
    );

    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const methods = {
  getAll,
  getAllId,
  addVet,
  updateVet,
  deleteVet
};
