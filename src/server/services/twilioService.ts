import twilio from 'twilio';
const { RestException } = twilio;

const serviceSid = process.env.TWILIO_SERVICE_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const accountSid = process.env.TWILIO_ACCOUNT_SID!;

const client = twilio(accountSid, authToken);

export const sendOtpToPhoneNumber = async (phoneNumber: string) => {
    try {
        if(!phoneNumber) {
            throw new Error("Phone number is required");
        }
        
        const response = await client.verify.v2.services(serviceSid).verifications.create({
            to: phoneNumber,
            channel: 'sms'
        });

        console.log(`OTP sent to ${phoneNumber}. SID: ${response}`);
        return response;
    } catch (error) {
        if (error instanceof RestException) {
            console.log(`Twilio Error ${error.code}: ${error.message}`);
            console.log(`Status: ${error.status}`);
            console.log(`More info: ${error.moreInfo}`);
        } else {
            console.error('Other error:', error);
        }
        throw error;
    }
}

export const verifyTwilioOtp = async (phoneNumber: string, otp: string) => {
    try {
        if(!phoneNumber || !otp) {
            throw new Error("Phone number and OTP are required");
        }

        const response = await client.verify.v2.services(serviceSid).verificationChecks.create({
            to: phoneNumber,
            code: otp
        });

        console.log(`OTP verified for ${phoneNumber}. SID: ${response}`);
        return response;
    } catch (error) {
        if (error instanceof RestException) {
            console.log(`Twilio Error ${error.code}: ${error.message}`);
            console.log(`Status: ${error.status}`);
            console.log(`More info: ${error.moreInfo}`);
        } else {
            console.error('Other error:', error);
        }
        throw error;
    }
}