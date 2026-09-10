import Conversation from "@/server/models/Conversation";
import Message from "@/server/models/Message";
import { uploadToCloudinary } from "@/server/services/cloudinaryService";
import { getCurrentUserId } from "@/server/utils/getCurrentUser";
import { response } from "@/server/utils/responseHandler";
import { NextRequest } from "next/server";

export const sendMessage = async (req: NextRequest) => {
  try {
    const userId = await getCurrentUserId();

    const formData = await req.formData();

    const content =
      (formData.get("content") as string | null)?.trim() || null;

    const files = formData.getAll("files") as File[] | null;

    const receiverId = formData.get("receiverId") as string | null;

    const conversationId = formData.get("conversationId") as string | null;

    // --------------------------------
    // Validate message
    // --------------------------------

    if (!content && (!files || files.length === 0)) {
      throw new Error("Message content or file is required");
    }

    // --------------------------------
    // Find or create conversation
    // --------------------------------

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }
    } else {
      if (!receiverId) {
        throw new Error("Receiver ID is required");
      }

      conversation = await Conversation.findOne({
        participants: {
          $all: [userId, receiverId],
          $size: 2,
        },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [userId, receiverId],
        });

        await conversation.save();
      }
    }

    // --------------------------------
    // Create message
    // --------------------------------

    const message = new Message({
      conversation: conversation._id,
      sender: userId,
      content,
    });

    // --------------------------------
    // Initialize message statuses
    // --------------------------------

    const messageStatuses = new Map();

    for (const participantId of conversation.participants) {
    const id = participantId.toString();

        if (id !== userId.toString()) {
            messageStatuses.set(id, {});
        }
    }

    message.messageStatuses = messageStatuses;

    // --------------------------------
    // Upload media
    // --------------------------------

    const maxImageFileSize = 10 * 1024 * 1024; // 10 MB
    const maxDocsFileSize = 50 * 1024 * 1024; // 50 MB

    if (files && files.length > 0) {
      const allowedTypes = [
        "image",
        "video",
        "application",
        "audio",
      ];

      for (const file of files) {
        if (file instanceof File && file.size > 0) {
          const mimeType = file.type.split("/")[0];

          if (!allowedTypes.includes(mimeType)) {
            throw new Error(
              `Unsupported file type: ${file.type}`
            );
          }

          // Image
          if (
            mimeType === "image" &&
            file.size <= maxImageFileSize
          ) {
            const uploadResult = await uploadToCloudinary(
              file,
              "chat-media"
            );

            message.media.push({
              url: uploadResult.secure_url,
              type: "image",
            });
          }

          // Other files
          else if (file.size <= maxDocsFileSize) {
            const uploadResult = await uploadToCloudinary(
              file,
              "chat-media"
            );

            message.media.push({
              url: uploadResult.secure_url,
              type: mimeType,
            });
          }

          // File too large
          else {
            throw new Error("File size exceeds the limit");
          }
        }
      }
    }

    // --------------------------------
    // Save message
    // --------------------------------

    await message.save();

    // --------------------------------
    // Update unread counts
    // --------------------------------

    for (const participantId of conversation.participants) {
      const id = participantId.toString();

      // Don't count the sender's own message as unread
      if (id !== userId.toString()) {
        const current =
          conversation.unreadCounts.get(id) || 0;

        conversation.unreadCounts.set(id, current + 1);
      }
    }

    // --------------------------------
    // Update conversation
    // --------------------------------

    conversation.lastMessage = message._id;

    await conversation.save();

    // --------------------------------
    // Get populated message
    // --------------------------------

    const populatedMessage = await Message.findById(
      message._id
    ).lean();

    return response(
      201,
      "Message sent successfully",
      {
        populatedMessage,
      }
    );
  } catch (err) {
    if (err instanceof Error) {
      return response(400, err.message);
    }

    return response(500, "Internal server error");
  }
};