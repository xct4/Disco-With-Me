import * as React from "react";
import {
  Send,
  Trash2,
  Plus,
  X,
  Copy,
  Bookmark,
  History,
  Sliders,
  Play,
  Square,
  RefreshCw,
  Download,
  Upload,
  Clock,
  Layers,
  Paperclip,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { Separator } from "./components/ui/separator";
import { DiscordPreview } from "./components/DiscordPreview";
import type {
  EmbedItem,
  EmbedField,
  PollConfig,
  SavedWebhook,
  HistoryItem,
  WebhookInfo,
} from "./types";

const COLOR_PRESETS = [
  { name: "Blurple", value: "#5865F2" },
  { name: "Green", value: "#57F287" },
  { name: "Yellow", value: "#FEE75C" },
  { name: "Fuchsia", value: "#EB459E" },
  { name: "Red", value: "#ED4245" },
  { name: "Cyan", value: "#00B0F4" },
  { name: "Dark", value: "#202225" },
  { name: "White", value: "#FFFFFF" },
];

export default function App() {
  const [activeTab, setActiveTab] = React.useState("message");
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [threadId, setThreadId] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tts, setTts] = React.useState(false);
  const [suppressEmbeds, setSuppressEmbeds] = React.useState(false);
  const [suppressNotifications, setSuppressNotifications] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [embeds, setEmbeds] = React.useState<EmbedItem[]>([]);
  const [activeEmbedIdx, setActiveEmbedIdx] = React.useState(0);
  const [poll, setPoll] = React.useState<PollConfig>({
    enabled: false,
    question: "",
    answers: [
      { id: "1", text: "" },
      { id: "2", text: "" },
    ],
    allowMultiselect: false,
    duration: 24,
  });

  const [isSending, setIsSending] = React.useState(false);
  const [isSpamming, setIsSpamming] = React.useState(false);
  const [spamDelay, setSpamDelay] = React.useState(1000);
  const spamStopRef = React.useRef(false);

  const [savedWebhooks, setSavedWebhooks] = React.useState<SavedWebhook[]>([]);
  const [newWebhookName, setNewWebhookName] = React.useState("");
  const [newWebhookUrl, setNewWebhookUrl] = React.useState("");

  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  const [editUrl, setEditUrl] = React.useState("");
  const [editInfo, setEditInfo] = React.useState<WebhookInfo | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editAvatarBase64, setEditAvatarBase64] = React.useState("");
  const [isLoadingEdit, setIsLoadingEdit] = React.useState(false);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const avatarFileInputRef = React.useRef<HTMLInputElement>(null);
  const textImportRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    try {
      const storedSaved = localStorage.getItem("savedWebhooks");
      if (storedSaved) {
        setSavedWebhooks(JSON.parse(storedSaved));
      }
      const storedHistory = localStorage.getItem("webhookHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch {
      toast.error("Failed to read cached data");
    }

    const params = new URLSearchParams(window.location.search);
    const paramWebhook = params.get("webhook");
    if (paramWebhook) {
      setWebhookUrl(paramWebhook);
      setEditUrl(paramWebhook);
      toast.success("Webhook URL loaded from query params");
    }
  }, []);

  const isValidUrl = (url: string) => {
    return /^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+/.test(
      url.trim()
    );
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        toast.success("Avatar image loaded locally");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleImportTextContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setContent(reader.result);
        toast.success(`Imported ${file.name}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportTextContent = () => {
    if (!content) {
      toast.error("Message content is empty");
      return;
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `message-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Message content exported as .txt");
  };

  const saveToSavedWebhooks = (name: string, url: string) => {
    if (!name.trim() || !url.trim()) {
      toast.error("Please provide both name and URL");
      return;
    }
    if (!isValidUrl(url)) {
      toast.error("Invalid Discord webhook URL");
      return;
    }
    const updated: SavedWebhook[] = [
      ...savedWebhooks.filter((w) => w.url !== url.trim()),
      { id: Date.now().toString(), name: name.trim(), url: url.trim() },
    ];
    setSavedWebhooks(updated);
    localStorage.setItem("savedWebhooks", JSON.stringify(updated));
    setNewWebhookName("");
    setNewWebhookUrl("");
    toast.success("Webhook saved to library");
  };

  const removeSavedWebhook = (id: string) => {
    const updated = savedWebhooks.filter((w) => w.id !== id);
    setSavedWebhooks(updated);
    localStorage.setItem("savedWebhooks", JSON.stringify(updated));
    toast.info("Webhook removed");
  };

  const appendHistory = (url: string, payload: Record<string, unknown>, summary?: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      webhookUrl: url,
      payload,
      summary,
    };
    const updated = [newItem, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("webhookHistory", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("webhookHistory");
    toast.info("History cleared");
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {};

    if (username.trim()) payload.username = username.trim();
    if (avatarUrl.trim()) payload.avatar_url = avatarUrl.trim();
    if (content.trim()) payload.content = content;
    if (tts) payload.tts = true;

    let flags = 0;
    if (suppressEmbeds) flags |= 4;
    if (suppressNotifications) flags |= 4096;
    if (flags > 0) payload.flags = flags;

    if (embeds.length > 0) {
      payload.embeds = embeds.map((em) => {
        const item: Record<string, unknown> = {};
        if (em.title?.trim()) item.title = em.title.trim();
        if (em.description?.trim()) item.description = em.description;
        if (em.url?.trim()) item.url = em.url.trim();

        if (em.color) {
          const hex = em.color.replace("#", "");
          const parsed = parseInt(hex, 16);
          if (!isNaN(parsed)) item.color = parsed;
        }

        if (em.author?.trim()) {
          const authorObj: Record<string, string> = { name: em.author.trim() };
          if (em.authorIcon?.trim()) authorObj.icon_url = em.authorIcon.trim();
          if (em.authorUrl?.trim()) authorObj.url = em.authorUrl.trim();
          item.author = authorObj;
        }

        if (em.footer?.trim() || em.footerIcon?.trim()) {
          const footerObj: Record<string, string> = {};
          if (em.footer?.trim()) footerObj.text = em.footer.trim();
          if (em.footerIcon?.trim()) footerObj.icon_url = em.footerIcon.trim();
          item.footer = footerObj;
        }

        if (em.timestamp) {
          item.timestamp = em.timestamp;
        }

        if (em.thumbnail?.trim()) {
          item.thumbnail = { url: em.thumbnail.trim() };
        }

        if (em.image?.trim()) {
          item.image = { url: em.image.trim() };
        }

        if (em.fields && em.fields.length > 0) {
          const validFields = em.fields
            .filter((f) => f.name.trim() && f.value.trim())
            .map((f) => ({
              name: f.name.trim(),
              value: f.value,
              inline: Boolean(f.inline),
            }));
          if (validFields.length > 0) {
            item.fields = validFields;
          }
        }

        return item;
      });
    }

    if (poll.enabled) {
      if (poll.question.trim() && poll.answers.filter((a) => a.text.trim()).length >= 2) {
        payload.poll = {
          question: { text: poll.question.trim() },
          answers: poll.answers
            .filter((a) => a.text.trim())
            .map((a) => ({ poll_media: { text: a.text.trim() } })),
          allow_multiselect: poll.allowMultiselect,
          duration: Number(poll.duration) || 24,
          layout_type: 1,
        };
      }
    }

    payload.allowed_mentions = {
      parse: ["users", "roles", "everyone"],
    };

    return payload;
  };

  const executeSend = async (targetUrl: string, customPayload?: Record<string, unknown>) => {
    const payload = customPayload || buildPayload();

    const hasContent = Boolean(payload.content);
    const hasEmbeds = Array.isArray(payload.embeds) && payload.embeds.length > 0;
    const hasPoll = Boolean(payload.poll);
    const hasFiles = files.length > 0;

    if (!hasContent && !hasEmbeds && !hasPoll && !hasFiles) {
      throw new Error("Message content, embeds, poll, or file attachment is required");
    }

    const dest = new URL(targetUrl.trim());
    if (threadId.trim()) {
      dest.searchParams.set("thread_id", threadId.trim());
    }

    let response: Response;

    if (files.length > 0 && !customPayload) {
      const formData = new FormData();
      formData.append("payload_json", JSON.stringify(payload));
      files.forEach((file, idx) => {
        formData.append(`files[${idx}]`, file, file.name);
      });
      response = await fetch(dest.toString(), {
        method: "POST",
        body: formData,
      });
    } else {
      response = await fetch(dest.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    if (response.status === 429) {
      const rateData = await response.json().catch(() => ({}));
      const waitTime = rateData.retry_after ? Number(rateData.retry_after) * 1000 : 2000;
      throw new Error(`Rate limited. Retry after ${(waitTime / 1000).toFixed(1)}s`);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Failed with status ${response.status}: ${errText.slice(0, 100)}`);
    }

    return payload;
  };

  const handleSendMessage = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a Webhook URL");
      return;
    }
    if (!isValidUrl(webhookUrl)) {
      toast.error("Invalid Discord webhook URL format");
      return;
    }

    setIsSending(true);
    try {
      const sentPayload = await executeSend(webhookUrl);
      const summaryText = content.slice(0, 40) || (embeds[0]?.title ?? "Webhook message");
      appendHistory(webhookUrl, sentPayload, summaryText);
      toast.success("Webhook message sent successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const startSpam = async () => {
    if (!webhookUrl.trim() || !isValidUrl(webhookUrl)) {
      toast.error("Valid Webhook URL is required to spam");
      return;
    }

    setIsSpamming(true);
    spamStopRef.current = false;
    toast.info("Spam started");

    const payload = buildPayload();

    while (!spamStopRef.current) {
      try {
        await executeSend(webhookUrl, payload);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg);
        if (msg.includes("Rate limited")) {
          await new Promise((r) => setTimeout(r, 2500));
          continue;
        }
        break;
      }
      await new Promise((r) => setTimeout(r, Math.max(200, spamDelay)));
    }

    setIsSpamming(false);
    spamStopRef.current = false;
    toast.info("Spam stopped");
  };

  const stopSpam = () => {
    spamStopRef.current = true;
    setIsSpamming(false);
  };

  const handleDeleteWebhook = async (targetUrl: string) => {
    if (!targetUrl.trim() || !isValidUrl(targetUrl)) {
      toast.error("Invalid Webhook URL");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this webhook permanently from Discord?")) {
      return;
    }

    try {
      const res = await fetch(targetUrl.trim(), { method: "DELETE" });
      if (res.status === 204 || res.ok) {
        toast.success("Webhook permanently deleted");
        if (targetUrl === webhookUrl) setWebhookUrl("");
        if (targetUrl === editUrl) {
          setEditUrl("");
          setEditInfo(null);
        }
      } else {
        toast.error(`Deletion failed: ${res.status}`);
      }
    } catch {
      toast.error("Failed to connect to Discord API");
    }
  };

  const handleFetchEditInfo = async () => {
    if (!editUrl.trim() || !isValidUrl(editUrl)) {
      toast.error("Valid Webhook URL required");
      return;
    }

    setIsLoadingEdit(true);
    try {
      const res = await fetch(editUrl.trim());
      if (!res.ok) {
        throw new Error(`Failed to load webhook info: ${res.status}`);
      }
      const data: WebhookInfo = await res.json();
      setEditInfo(data);
      setEditName(data.name || "");
      toast.success("Webhook details loaded");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editUrl.trim() || !isValidUrl(editUrl)) {
      toast.error("Valid Webhook URL required");
      return;
    }

    setIsSavingEdit(true);
    try {
      const bodyPayload: Record<string, unknown> = {};
      if (editName.trim()) bodyPayload.name = editName.trim();
      if (editAvatarBase64) bodyPayload.avatar = editAvatarBase64;

      const res = await fetch(editUrl.trim(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        throw new Error(`Failed to update webhook: ${res.status}`);
      }

      const updatedData: WebhookInfo = await res.json();
      setEditInfo(updatedData);
      setEditAvatarBase64("");
      toast.success("Webhook updated successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEditAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditAvatarBase64(reader.result);
        toast.success("Avatar image loaded");
      }
    };
    reader.readAsDataURL(file);
  };

  const addEmbed = () => {
    if (embeds.length >= 10) {
      toast.error("Discord limits webhooks to 10 embeds");
      return;
    }
    const newEmbed: EmbedItem = {
      id: Date.now().toString(),
      title: "",
      description: "",
      color: "#5865F2",
      fields: [],
    };
    setEmbeds([...embeds, newEmbed]);
    setActiveEmbedIdx(embeds.length);
  };

  const removeEmbed = (idx: number) => {
    const updated = embeds.filter((_, i) => i !== idx);
    setEmbeds(updated);
    setActiveEmbedIdx(Math.max(0, idx - 1));
  };

  const updateCurrentEmbed = (key: keyof EmbedItem, value: unknown) => {
    if (!embeds[activeEmbedIdx]) return;
    const updated = [...embeds];
    updated[activeEmbedIdx] = {
      ...updated[activeEmbedIdx],
      [key]: value,
    };
    setEmbeds(updated);
  };

  const addFieldToCurrentEmbed = () => {
    if (!embeds[activeEmbedIdx]) return;
    if ((embeds[activeEmbedIdx].fields?.length || 0) >= 25) {
      toast.error("Discord limits each embed to 25 fields");
      return;
    }
    const newField: EmbedField = {
      id: Date.now().toString(),
      name: "",
      value: "",
      inline: false,
    };
    updateCurrentEmbed("fields", [
      ...(embeds[activeEmbedIdx].fields || []),
      newField,
    ]);
  };

  const updateFieldInCurrentEmbed = (
    fieldId: string,
    key: keyof EmbedField,
    value: unknown
  ) => {
    if (!embeds[activeEmbedIdx]) return;
    const currentFields = embeds[activeEmbedIdx].fields || [];
    const updated = currentFields.map((f) =>
      f.id === fieldId ? { ...f, [key]: value } : f
    );
    updateCurrentEmbed("fields", updated);
  };

  const removeFieldFromCurrentEmbed = (fieldId: string) => {
    if (!embeds[activeEmbedIdx]) return;
    const currentFields = embeds[activeEmbedIdx].fields || [];
    updateCurrentEmbed(
      "fields",
      currentFields.filter((f) => f.id !== fieldId)
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 10) {
      toast.error("Maximum 10 attachments allowed");
      return;
    }
    setFiles([...files, ...selected]);
    toast.success(`${selected.length} file(s) attached`);
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const clearForm = () => {
    setContent("");
    setUsername("");
    setAvatarUrl("");
    setThreadId("");
    setFiles([]);
    setEmbeds([]);
    setTts(false);
    setSuppressEmbeds(false);
    setSuppressNotifications(false);
    setPoll({
      enabled: false,
      question: "",
      answers: [
        { id: "1", text: "" },
        { id: "2", text: "" },
      ],
      allowMultiselect: false,
      duration: 24,
    });
    toast.info("Form reset");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const currentEmbed = embeds[activeEmbedIdx];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative overflow-x-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 isolate contain-strict pointer-events-none overflow-hidden"
      >
        <div className="w-[560px] h-[1280px] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="h-[1280px] absolute left-0 top-0 w-[240px] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-[1280px] -translate-y-[350px] absolute left-0 top-0 w-[240px] -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>

      <div className="mx-auto max-w-5xl py-8 relative px-4 sm:px-6 w-full flex-1">
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground tracking-tight">
          Disco With Me
        </h1>

        <Tabs
          defaultValue="message"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col gap-2"
        >
          <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] grid w-full grid-cols-4 bg-muted/80">
            <TabsTrigger value="message" className="rounded-md">
              Message
            </TabsTrigger>
            <TabsTrigger value="edit" className="rounded-md">
              Edit
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="rounded-md">
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-md">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="message" className="space-y-4 mt-4">
            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="w-4 h-4" /> Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Enter your webhook URL and customize the sender
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    {webhookUrl.trim() && (
                      <span
                        className={`text-xs flex items-center gap-1 font-medium ${
                          isValidUrl(webhookUrl)
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isValidUrl(webhookUrl) ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {isValidUrl(webhookUrl) ? "Valid URL" : "Invalid URL"}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="webhook-url"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="bg-background/80 h-9"
                    />
                    {savedWebhooks.length > 0 && (
                      <select
                        aria-label="Load Saved Webhook"
                        className="bg-card border border-input rounded-md px-2 text-xs text-foreground h-9 max-w-[140px]"
                        onChange={(e) => {
                          if (e.target.value) setWebhookUrl(e.target.value);
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Saved...
                        </option>
                        {savedWebhooks.map((sw) => (
                          <option key={sw.id} value={sw.url}>
                            {sw.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <Label htmlFor="custom-username" className="h-5 flex items-center text-xs">
                      Custom Bot Name
                    </Label>
                    <Input
                      id="custom-username"
                      placeholder="Disco With Me"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-background/80 h-9"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <div className="h-5 flex items-center justify-between text-xs">
                      <Label htmlFor="avatar-url">Avatar (URL or File)</Label>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl("")}
                          className="text-[10px] text-destructive hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="avatar-url"
                        placeholder="https://example.com/avatar.png"
                        value={avatarUrl.startsWith("data:") ? "[Local Image File]" : avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="bg-background/80 h-9 text-xs flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="h-9 px-3 shrink-0 text-xs flex items-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> File
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarFileInputRef}
                        className="hidden"
                        onChange={handleAvatarFileUpload}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <Label htmlFor="thread-id" className="h-5 flex items-center text-xs">
                      Thread ID (Optional)
                    </Label>
                    <Input
                      id="thread-id"
                      placeholder="123456789012345678"
                      value={threadId}
                      onChange={(e) => setThreadId(e.target.value)}
                      className="bg-background/80 h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">Message Content</CardTitle>
                    <CardDescription>
                      Enter your message content with full markdown formatting
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => textImportRef.current?.click()}
                      className="h-7 text-xs flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> Import (.txt / .json)
                    </Button>
                    <input
                      type="file"
                      ref={textImportRef}
                      className="hidden"
                      onChange={handleImportTextContent}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleExportTextContent}
                      className="h-7 text-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Export (.txt)
                    </Button>
                    <span className="text-xs text-muted-foreground font-mono pl-1">
                      {content.length}/2000
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5 pb-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => setContent((c) => c + "@everyone ")}
                  >
                    @everyone
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => setContent((c) => c + "@here ")}
                  >
                    @here
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px] font-bold"
                    onClick={() => setContent((c) => c + "**Bold** ")}
                  >
                    B
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px] italic"
                    onClick={() => setContent((c) => c + "*Italic* ")}
                  >
                    I
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px] underline"
                    onClick={() => setContent((c) => c + "__Underline__ ")}
                  >
                    U
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px] line-through"
                    onClick={() => setContent((c) => c + "~~Strike~~ ")}
                  >
                    S
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px] font-mono"
                    onClick={() => setContent((c) => c + "`code` ")}
                  >
                    Inline Code
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px] font-mono"
                    onClick={() => setContent((c) => c + "\n```\ncode block\n```\n")}
                  >
                    Code Block
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => setContent((c) => c + "\n> Quote\n")}
                  >
                    Quote
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => setContent((c) => c + "||Spoiler|| ")}
                  >
                    Spoiler
                  </Button>
                </div>

                <Textarea
                  placeholder="Enter your message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px] bg-background/80 font-mono text-sm"
                  maxLength={2000}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border">
                    <Label htmlFor="switch-tts" className="text-xs cursor-pointer">
                      Text to Speech (TTS)
                    </Label>
                    <Switch
                      id="switch-tts"
                      checked={tts}
                      onCheckedChange={setTts}
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border">
                    <Label
                      htmlFor="switch-suppress-embeds"
                      className="text-xs cursor-pointer"
                    >
                      Suppress Embeds
                    </Label>
                    <Switch
                      id="switch-suppress-embeds"
                      checked={suppressEmbeds}
                      onCheckedChange={setSuppressEmbeds}
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border">
                    <Label
                      htmlFor="switch-notifications"
                      className="text-xs cursor-pointer"
                    >
                      Silent Message
                    </Label>
                    <Switch
                      id="switch-notifications"
                      checked={suppressNotifications}
                      onCheckedChange={setSuppressNotifications}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Paperclip className="w-4 h-4" /> File Attachments
                    </CardTitle>
                    <CardDescription>
                      Attach up to 10 files (images, logs, documents)
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Files
                  </Button>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </CardHeader>
              {files.length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-muted/60 border border-border px-3 py-1.5 rounded-md text-xs"
                      >
                        <span className="font-medium truncate max-w-[140px]">
                          {f.name}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          ({(f.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Embeds
                    </CardTitle>
                    <CardDescription>
                      Add rich embeds to your message
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addEmbed}
                    className="h-8 text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Embed
                  </Button>
                </div>
              </CardHeader>

              {embeds.length > 0 && (
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
                    {embeds.map((emb, idx) => (
                      <div
                        key={emb.id}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md cursor-pointer text-xs font-medium transition-colors ${
                          activeEmbedIdx === idx
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                        onClick={() => setActiveEmbedIdx(idx)}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: emb.color || "#5865F2" }}
                        />
                        <span>Embed {idx + 1}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEmbed(idx);
                          }}
                          className="ml-1 hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {currentEmbed && (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Embed Title</Label>
                          <Input
                            placeholder="Title"
                            value={currentEmbed.title || ""}
                            onChange={(e) =>
                              updateCurrentEmbed("title", e.target.value)
                            }
                            className="bg-background/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Title URL</Label>
                          <Input
                            placeholder="https://example.com"
                            value={currentEmbed.url || ""}
                            onChange={(e) =>
                              updateCurrentEmbed("url", e.target.value)
                            }
                            className="bg-background/80"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Embed Description</Label>
                        <Textarea
                          placeholder="Markdown description..."
                          value={currentEmbed.description || ""}
                          onChange={(e) =>
                            updateCurrentEmbed("description", e.target.value)
                          }
                          className="bg-background/80 font-mono text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label>Embed Color</Label>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="color"
                            value={currentEmbed.color || "#5865F2"}
                            onChange={(e) =>
                              updateCurrentEmbed("color", e.target.value)
                            }
                            className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent p-0"
                          />
                          <Input
                            value={currentEmbed.color || "#5865F2"}
                            onChange={(e) =>
                              updateCurrentEmbed("color", e.target.value)
                            }
                            className="w-28 font-mono text-xs bg-background/80"
                          />
                          <div className="flex flex-wrap gap-1">
                            {COLOR_PRESETS.map((p) => (
                              <button
                                key={p.name}
                                type="button"
                                title={p.name}
                                style={{ backgroundColor: p.value }}
                                onClick={() =>
                                  updateCurrentEmbed("color", p.value)
                                }
                                className="w-5 h-5 rounded-full border border-border/60 hover:scale-110 transition-transform"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label>Author Name</Label>
                          <Input
                            placeholder="Author Name"
                            value={currentEmbed.author || ""}
                            onChange={(e) =>
                              updateCurrentEmbed("author", e.target.value)
                            }
                            className="bg-background/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Author Icon URL</Label>
                          <Input
                            placeholder="https://example.com/icon.png"
                            value={currentEmbed.authorIcon || ""}
                            onChange={(e) =>
                              updateCurrentEmbed("authorIcon", e.target.value)
                            }
                            className="bg-background/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Author URL</Label>
                          <Input
                            placeholder="https://example.com"
                            value={currentEmbed.authorUrl || ""}
                            onChange={(e) =>
                              updateCurrentEmbed("authorUrl", e.target.value)
                            }
                            className="bg-background/80"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Thumbnail URL</Label>
                          <Input
                            placeholder="https://example.com/thumbnail.png"
                            value={currentEmbed.thumbnail || ""}
                            onChange={(e) =>
                              updateCurrentEmbed("thumbnail", e.target.value)
                            }
                            className="bg-background/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Main Image URL</Label>
                          <Input
                            placeholder="https://example.com/image.png"
                            value={currentEmbed.image || ""}
                            onChange={(e) =>
                              updateCurrentEmbed("image", e.target.value)
                            }
                            className="bg-background/80"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">
                            Embed Fields ({(currentEmbed.fields || []).length}/25)
                          </Label>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={addFieldToCurrentEmbed}
                            className="h-7 text-xs flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Field
                          </Button>
                        </div>

                        {(currentEmbed.fields || []).map((field) => (
                          <div
                            key={field.id}
                            className="p-3 bg-muted/30 rounded-lg border border-border space-y-2"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <div className="sm:col-span-5">
                                <Input
                                  placeholder="Field Name"
                                  value={field.name}
                                  onChange={(e) =>
                                    updateFieldInCurrentEmbed(
                                      field.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-xs bg-background/80"
                                />
                              </div>
                              <div className="sm:col-span-5">
                                <Input
                                  placeholder="Field Value"
                                  value={field.value}
                                  onChange={(e) =>
                                    updateFieldInCurrentEmbed(
                                      field.id,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-xs bg-background/80"
                                />
                              </div>
                              <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                                <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={field.inline}
                                    onChange={(e) =>
                                      updateFieldInCurrentEmbed(
                                        field.id,
                                        "inline",
                                        e.target.checked
                                      )
                                    }
                                    className="rounded"
                                  />
                                  Inline
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFieldFromCurrentEmbed(field.id)
                                  }
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5 sm:col-span-1">
                          <Label>Footer Text</Label>
                          <Input
                            placeholder="Footer Text"
                            value={currentEmbed.footer || ""}
                            onChange={(e) =>
                              updateCurrentEmbed("footer", e.target.value)
                            }
                            className="bg-background/80"
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-1">
                          <Label>Footer Icon URL</Label>
                          <Input
                            placeholder="https://example.com/footer-icon.png"
                            value={currentEmbed.footerIcon || ""}
                            onChange={(e) =>
                              updateCurrentEmbed("footerIcon", e.target.value)
                            }
                            className="bg-background/80"
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-1 flex flex-col justify-end">
                          <Button
                            type="button"
                            variant={currentEmbed.timestamp ? "default" : "outline"}
                            size="sm"
                            className="h-9 text-xs flex items-center gap-1.5"
                            onClick={() =>
                              updateCurrentEmbed(
                                "timestamp",
                                currentEmbed.timestamp
                                  ? undefined
                                  : new Date().toISOString()
                              )
                            }
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {currentEmbed.timestamp
                              ? "Timestamp Enabled"
                              : "Include Timestamp"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Poll</CardTitle>
                    <CardDescription>
                      Create an interactive Discord poll
                    </CardDescription>
                  </div>
                  <Switch
                    checked={poll.enabled}
                    onCheckedChange={(v) =>
                      setPoll((p) => ({ ...p, enabled: v }))
                    }
                  />
                </div>
              </CardHeader>
              {poll.enabled && (
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Poll Question</Label>
                    <Input
                      placeholder="Question"
                      value={poll.question}
                      onChange={(e) =>
                        setPoll((p) => ({ ...p, question: e.target.value }))
                      }
                      className="bg-background/80"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Poll Answers</Label>
                    {poll.answers.map((ans, idx) => (
                      <div key={ans.id} className="flex gap-2 items-center">
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          value={ans.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPoll((p) => ({
                              ...p,
                              answers: p.answers.map((a) =>
                                a.id === ans.id ? { ...a, text: val } : a
                              ),
                            }));
                          }}
                          className="bg-background/80 text-xs"
                        />
                        {poll.answers.length > 2 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setPoll((p) => ({
                                ...p,
                                answers: p.answers.filter((a) => a.id !== ans.id),
                              }))
                            }
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {poll.answers.length < 10 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setPoll((p) => ({
                            ...p,
                            answers: [
                              ...p.answers,
                              { id: Date.now().toString(), text: "" },
                            ],
                          }))
                        }
                        className="h-7 text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Option
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Allow Multiple Choices</Label>
                      <Switch
                        checked={poll.allowMultiselect}
                        onCheckedChange={(v) =>
                          setPoll((p) => ({ ...p, allowMultiselect: v }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Duration</Label>
                      <select
                        aria-label="Poll Duration"
                        value={poll.duration}
                        onChange={(e) =>
                          setPoll((p) => ({
                            ...p,
                            duration: Number(e.target.value),
                          }))
                        }
                        className="bg-card border border-input rounded-md px-2 py-1 text-xs text-foreground"
                      >
                        <option value={1}>1 Hour</option>
                        <option value={4}>4 Hours</option>
                        <option value={8}>8 Hours</option>
                        <option value={24}>24 Hours</option>
                        <option value={72}>3 Days</option>
                        <option value={168}>7 Days</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview</CardTitle>
                <CardDescription>
                  How your message will appear in Discord
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DiscordPreview
                  username={username}
                  avatarUrl={avatarUrl}
                  content={content}
                  embeds={embeds}
                  poll={poll}
                  files={files}
                />
              </CardContent>
            </Card>

            <div className="p-4 bg-card/60 backdrop-blur rounded-xl border border-border flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || isSpamming}
                  className="flex items-center gap-2 px-5 bg-primary text-primary-foreground font-semibold"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? "Sending..." : "Send Webhook"}
                </Button>

                {isSpamming ? (
                  <Button
                    onClick={stopSpam}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" /> Stop Spam
                  </Button>
                ) : (
                  <Button
                    onClick={startSpam}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" /> Spam
                  </Button>
                )}

                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-muted-foreground">Interval:</span>
                  <Input
                    type="number"
                    value={spamDelay}
                    onChange={(e) => setSpamDelay(Number(e.target.value) || 1000)}
                    className="w-20 h-8 text-xs bg-background/80"
                    min={200}
                    step={100}
                  />
                  <span className="text-xs text-muted-foreground">ms</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={clearForm}
                  variant="ghost"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Form
                </Button>
                <Button
                  onClick={() => handleDeleteWebhook(webhookUrl)}
                  variant="destructive"
                  size="sm"
                  className="text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Webhook
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> Edit Webhook
                </CardTitle>
                <CardDescription>
                  Modify the webhook's settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-url">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-url"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="bg-background/80"
                    />
                    <Button
                      onClick={handleFetchEditInfo}
                      disabled={isLoadingEdit}
                      variant="secondary"
                      className="flex items-center gap-1.5 shrink-0"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          isLoadingEdit ? "animate-spin" : ""
                        }`}
                      />
                      Fetch Details
                    </Button>
                  </div>
                </div>

                {editInfo && (
                  <div className="p-4 bg-muted/40 rounded-lg border border-border space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border">
                          {editInfo.avatar ? (
                            <img
                              src={`https://cdn.discordapp.com/avatars/${editInfo.id}/${editInfo.avatar}.webp?size=128`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">
                              No Avatar
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-base text-foreground">
                            {editInfo.name || "Unnamed Webhook"}
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {editInfo.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setWebhookUrl(editUrl);
                            setActiveTab("message");
                            toast.success("Loaded into Message composer");
                          }}
                          className="text-xs"
                        >
                          Use in Message
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteWebhook(editUrl)}
                          className="text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-background/60 rounded border border-border flex justify-between items-center">
                        <span className="text-muted-foreground">Channel ID:</span>
                        <code
                          className="cursor-pointer hover:underline font-mono"
                          onClick={() => copyToClipboard(editInfo.channel_id)}
                        >
                          {editInfo.channel_id}
                        </code>
                      </div>
                      <div className="p-2.5 bg-background/60 rounded border border-border flex justify-between items-center">
                        <span className="text-muted-foreground">Guild ID:</span>
                        <code
                          className="cursor-pointer hover:underline font-mono"
                          onClick={() => copyToClipboard(editInfo.guild_id)}
                        >
                          {editInfo.guild_id}
                        </code>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">
                        Update Webhook Attributes
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="new-webhook-name">New Name</Label>
                          <Input
                            id="new-webhook-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Updated Bot Name"
                            className="bg-background/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="new-avatar-file">
                            Upload Avatar Image
                          </Label>
                          <Input
                            id="new-avatar-file"
                            type="file"
                            accept="image/*"
                            onChange={handleEditAvatarFile}
                            className="bg-background/80 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={handleSaveEdit}
                          disabled={isSavingEdit}
                          className="flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          {isSavingEdit ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4 mt-4">
            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bookmark className="w-4 h-4" /> Saved Webhooks
                </CardTitle>
                <CardDescription>
                  Manage your saved Discord webhooks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="save-name">Webhook Name</Label>
                    <Input
                      id="save-name"
                      placeholder="My Server Webhook"
                      value={newWebhookName}
                      onChange={(e) => setNewWebhookName(e.target.value)}
                      className="bg-background/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="save-url">Webhook URL</Label>
                    <Input
                      id="save-url"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      className="bg-background/80"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      saveToSavedWebhooks(newWebhookName, newWebhookUrl)
                    }
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Save Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader>
                <CardTitle className="text-base">Your Saved Webhooks</CardTitle>
                <CardDescription>
                  Manage and quickly load your stored webhooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedWebhooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No webhooks saved yet. Add one above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedWebhooks.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-card/50 border border-border"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm text-foreground truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate font-mono">
                            {item.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs flex items-center gap-1"
                            onClick={() => {
                              setWebhookUrl(item.url);
                              setActiveTab("message");
                              toast.success(`Selected "${item.name}"`);
                            }}
                          >
                            <Send className="w-3.5 h-3.5" /> Use
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(item.url)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeSavedWebhook(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <Card className="backdrop-blur-3xl bg-background/10 border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="w-4 h-4" /> Webhook History
                    </CardTitle>
                    <CardDescription>
                      Your previously sent webhook messages
                    </CardDescription>
                  </div>
                  {history.length > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={clearHistory}
                      className="text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear History
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No webhook history yet. Send a message to see it here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-lg bg-card/50 border border-border space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="font-mono">
                            {new Date(item.timestamp).toLocaleString("en-US", {
                              dateStyle: "short",
                              timeStyle: "medium",
                            })}
                          </span>
                          <span className="font-mono truncate max-w-[200px]">
                            {item.webhookUrl}
                          </span>
                        </div>
                        <div className="p-2 bg-background/80 rounded font-mono text-[11px] overflow-x-auto max-h-24">
                          {JSON.stringify(item.payload, null, 2)}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex items-center gap-1"
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(item.payload, null, 2)
                              )
                            }
                          >
                            <Copy className="w-3 h-3" /> Copy Payload
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs flex items-center gap-1"
                            onClick={async () => {
                              try {
                                await executeSend(
                                  item.webhookUrl,
                                  item.payload
                                );
                                toast.success("Message re-sent successfully");
                              } catch (e: unknown) {
                                const msg =
                                  e instanceof Error
                                    ? e.message
                                    : String(e);
                                toast.error(msg);
                              }
                            }}
                          >
                            <RefreshCw className="w-3 h-3" /> Re-send
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="mt-12 py-4 border-t border-border/40 text-center text-sm text-muted-foreground">
        Made by illusionTBA
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}
