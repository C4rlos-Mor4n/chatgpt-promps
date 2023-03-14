
async function obtenerFila() {
    const response = await fetch('https://sheet.best/api/sheets/5da9c042-b079-4f04-ae5d-36442eeb5b8a');
    const data = await response.json();
    return data
  }


  
  module.exports = { obtenerFila };
