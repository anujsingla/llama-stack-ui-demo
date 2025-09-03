import axios, { type AxiosResponse } from 'axios';

export interface IAIResponse {
    session_id: string | null;
    message: string;
    response: string;
    success: boolean;
    error: string;
}

export interface IAIPayload {
    message: string;
    session_id?: string;
}

const baseUrl = 'http://localhost:8000';

export const fetchAIData = async (bodyPayload: IAIPayload) => {
    const url = `${baseUrl}/chat`;
    const response: AxiosResponse<IAIResponse> = await axios.post(url, JSON.stringify(bodyPayload), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};
