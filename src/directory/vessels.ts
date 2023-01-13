import axios from "axios"

const getVessel = (imo: number | string) => {
    return axios.get(`https://api.fiskeridir.no/vessel-api/api/v1/vessels?query=imoNumber=${imo}`)
}

export default getVessel;