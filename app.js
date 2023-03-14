const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const ChatGPTClass = require('./class/chatgpt.class')
const { obtenerFila } = require('./api/API-Obtener-Datos');

const gpt = new ChatGPTClass()

const flujoConfirmacion = addKeyword('SI CONFIRMO')
.addAnswer('blablablla continua... chatbot')

const flujoCita = addKeyword('AGENDAR CITA')
.addAction(async() => {
    const data = await obtenerFila();
    const DatosCita = await data;
    const citas = DatosCita.map(fila => {
        const fechaHora = fila.CITAS.split('T');
        const fecha = fechaHora[0];
        const hora = fila.HORA;
        return `${fecha} a las ${hora}`;
    }).join(", ");

    const mensaje = `[INTRUCCIONES]: Te voy a compartir un calendario de mis citas programadas con la hora ${citas} las cuales necesito que analices a por cierto soy de ecuador y entiendas porque luego un {usuario} te va preguntar si tengo tiempo disponible para atenderlo. Mis citas suelen ser de 30min de Lunes a Viernes desde las 9:00 hasta las 17:00. Cuando el {usuario} te pregunta solo responde frases cortas de menos de 30 caracteres. IMPORTANTE cuando el {usuario} demuestre y confirme interes en reservar un cita obligatoriamente pidele que escriba “SI CONFIRMO”. Si entiendes la tarea que debes realizar responde con una sola palabra “OK”.`;   
    console.log(mensaje)

    await gpt.handleMsgChatGPT(mensaje);
    console.log('LLEGO HASTA AQUI', gpt)
})
.addAnswer('¿Como te puedo ayudar?', {capture:true}, async (ctx, {fallBack}) => {
    const body = ctx.body
    let response;
    if(body.toUpperCase() !== 'SI CONFIRMO'){
        response = await gpt.handleMsgChatGPT(body)
        await fallBack(response.text)
    }
    console.log(response)

})  

const flowPrincipal = addKeyword('hola').addAnswer([
    'Bivenido a clinica veterinaria *3000*'
])
.addAnswer('Si quieres agendar una cita marca la opcion',{
    buttons:[{body:'AGENDAR CITA'}]
},null,[flujoCita])


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flujoConfirmacion])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
