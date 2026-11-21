import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "@/modules/auth/presentation/jwt-auth.guard";
import { OptionalText } from "@/shared/http/text-fields";
import { AgentChatService } from "../application/agent-chat.service";

class MessageDto {
  @OptionalText(20_000) text?: string;
}

class ConversationDto {
  @OptionalText(200) title?: string;
}

const Id = () => Param("id", ParseUUIDPipe);

/** Dashboard API for the AI agents. Every route requires a signed-in admin. */
@Controller("admin/agents")
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly chat: AgentChatService) {}

  @Get()
  agents() {
    return this.chat.listAgents();
  }

  @Get(":agent/conversations")
  conversations(@Param("agent") agent: string) {
    return this.chat.listConversations(agent);
  }

  @Post(":agent/conversations")
  createConversation(@Param("agent") agent: string, @Body() body: ConversationDto) {
    return this.chat.createConversation(agent, body.title);
  }

  /** Messages, plans and whether the agent is still working; the dashboard polls it during a run. */
  @Get("conversations/:id")
  conversation(@Id() id: string) {
    return this.chat.getConversation(id);
  }

  /** Multipart: `text` and an optional catalog PDF in `file`. The agent answers in the background (202). */
  @Post("conversations/:id/messages")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 32 * 1024 * 1024, files: 1 } }))
  send(@Id() id: string, @Body() body: MessageDto, @UploadedFile() file?: Express.Multer.File) {
    return this.chat.sendMessage(id, body.text, file);
  }

  @Delete("conversations/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteConversation(@Id() id: string) {
    return this.chat.deleteConversation(id);
  }

  /** Carries the plan out in the background (202); the report appears in the chat. */
  @Post("plans/:id/approve")
  @HttpCode(HttpStatus.ACCEPTED)
  approve(@Id() id: string) {
    return this.chat.approvePlan(id);
  }

  @Post("plans/:id/reject")
  @HttpCode(HttpStatus.NO_CONTENT)
  reject(@Id() id: string) {
    return this.chat.rejectPlan(id);
  }

  /** The photo plan item `index` would get, cut from the catalog: lets the admin check photos before approving. */
  @Get("plans/:id/photos/:index")
  @Header("Content-Type", "image/jpeg")
  @Header("Cache-Control", "private, max-age=600")
  async photo(@Id() id: string, @Param("index", ParseIntPipe) index: number) {
    return new StreamableFile(await this.chat.previewPhoto(id, index));
  }
}
