import Conversation from "@/server/models/Conversation";
import Message from "@/server/models/Message";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { NextRequest } from "next/server";

export const sendMessage = async (req: NextRequest) => {
    try {
        const userId = await getCurrentUserId()

        const formData = await req.formData()

        const content = formData.get("content") as string | null
        const file = formData.get("file") as File | null

        const receiverId = formData.get("receiverId") as string | null
        const conversationId = formData.get("conversationId") as string | null

        let conversation

        if(conversationId) {
            conversation = await Conversation.findOne({
                _id: conversationId,
                participants: userId
            })

            if(!conversation) throw new Error("Conversation not found")  
        }else {
            conversation = await Conversation.findOne({
                participants: { $all: [userId, receiverId], $size: 2 }
            })

            if(!conversation) {
                conversation = await new Conversation({ participants: [userId, receiverId] })

                await conversation.save()
            }
        }

        const message = await new Message({
            conversation: conversation._id,
            sender: userId,
            receiver: receiverId,
            messageStatus: "sent",
            content
        })

        await message.save()

        const unreadCount = await Message.countDocuments({
            conversation: conversation._id,
            receiver: receiverId,
            messageStatus: { $ne: "seen" },
        });

        conversation.lastMessage = message._id

        await conversation.save()

        return response(200, "Message sent successfully")

    } catch (err) {
        if (err instanceof Error) {
            return response(400, err.message);
        }

        return response(500, "Internal server error");
    }
}

