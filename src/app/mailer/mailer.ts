import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { CustomAppError } from '../context/app.error';

// const directory = path.join(__dirname, '..', 'templates', 'verify.ejs');
const directory = '';
export const sendEmail = async (
  email: string,
  subject: string,
  template: string,
): Promise<string> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST as string,
      port: process.env.EMAIL_PORT as unknown as number,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASSWORD as string,
      },
    });
    const mailoptions = {
      from: process.env.EMAIL_HOST as string,
      to: email,
      subject: subject,
      html: template,
    };
    await transporter.sendMail(mailoptions);
    return 'Email sent';
  } catch (error) {
    throw new CustomAppError(error.message, 400);
  }
};

export const sendVerification = async (
  email: string,
  name: string,
  link: string,
  additionalhtml: string | string[] = '',
) => {
  try {
    const template = fs.readFileSync(directory, 'utf-8');
    const emailData = {
      recipientName: name,
      serverData: 'Please confirm registration',
      senderName: 'C-CHAT',
      link: link,
      moredata: [...additionalhtml],
    };
    const emailHtml = ejs.render(template, emailData);
    const response = await sendEmail(email, 'Verify Your Email', emailHtml);
    return response;
  } catch (error) {
    throw new CustomAppError(error.message, 400);
  }
};
