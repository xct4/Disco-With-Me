import * as React from "react";
import type { EmbedItem, PollConfig } from "../types";

interface DiscordPreviewProps {
  username?: string;
  avatarUrl?: string;
  content?: string;
  embeds?: EmbedItem[];
  poll?: PollConfig;
  files?: File[];
}

interface InviteData {
  code: string;
  guild?: {
    id: string;
    name: string;
    icon: string | null;
    description: string | null;
  };
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

function parseMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];
  const lines = text.split("\n");

  return lines.map((line, lIdx) => {
    const isQuote = line.startsWith("> ");
    const lineContent = isQuote ? line.slice(2) : line;

    const parts: React.ReactNode[] = [];
    let remaining = lineContent;
    let keyIdx = 0;

    while (remaining.length > 0) {
      if (remaining.startsWith("||")) {
        const end = remaining.indexOf("||", 2);
        if (end !== -1) {
          const spoilerText = remaining.slice(2, end);
          parts.push(
            <span
              key={`${lIdx}-${keyIdx++}`}
              className="bg-[#202225] text-transparent hover:text-white rounded px-1 cursor-pointer transition-colors"
            >
              {spoilerText}
            </span>
          );
          remaining = remaining.slice(end + 2);
          continue;
        }
      }

      if (remaining.startsWith("```")) {
        const end = remaining.indexOf("```", 3);
        if (end !== -1) {
          const codeText = remaining.slice(3, end);
          parts.push(
            <pre
              key={`${lIdx}-${keyIdx++}`}
              className="bg-[#1e1f22] p-2 rounded text-xs font-mono overflow-x-auto border border-[#2b2d31] my-1"
            >
              <code>{codeText}</code>
            </pre>
          );
          remaining = remaining.slice(end + 3);
          continue;
        }
      }

      if (remaining.startsWith("`")) {
        const end = remaining.indexOf("`", 1);
        if (end !== -1) {
          const codeText = remaining.slice(1, end);
          parts.push(
            <code
              key={`${lIdx}-${keyIdx++}`}
              className="bg-[#1e1f22] px-1 py-0.5 rounded text-xs font-mono text-[#e0e1e5]"
            >
              {codeText}
            </code>
          );
          remaining = remaining.slice(end + 1);
          continue;
        }
      }

      if (remaining.startsWith("**")) {
        const end = remaining.indexOf("**", 2);
        if (end !== -1) {
          const boldText = remaining.slice(2, end);
          parts.push(
            <strong key={`${lIdx}-${keyIdx++}`} className="font-bold">
              {boldText}
            </strong>
          );
          remaining = remaining.slice(end + 2);
          continue;
        }
      }

      if (remaining.startsWith("*")) {
        const end = remaining.indexOf("*", 1);
        if (end !== -1) {
          const italicText = remaining.slice(1, end);
          parts.push(
            <em key={`${lIdx}-${keyIdx++}`} className="italic">
              {italicText}
            </em>
          );
          remaining = remaining.slice(end + 1);
          continue;
        }
      }

      if (remaining.startsWith("~~")) {
        const end = remaining.indexOf("~~", 2);
        if (end !== -1) {
          const strikeText = remaining.slice(2, end);
          parts.push(
            <s key={`${lIdx}-${keyIdx++}`} className="line-through">
              {strikeText}
            </s>
          );
          remaining = remaining.slice(end + 2);
          continue;
        }
      }

      if (remaining.startsWith("@everyone") || remaining.startsWith("@here")) {
        const mention = remaining.startsWith("@everyone") ? "@everyone" : "@here";
        parts.push(
          <span
            key={`${lIdx}-${keyIdx++}`}
            className="bg-[#3c4270] text-[#c9cdfb] px-1 rounded hover:bg-[#5865F2] hover:text-white cursor-pointer font-medium"
          >
            {mention}
          </span>
        );
        remaining = remaining.slice(mention.length);
        continue;
      }

      const matchUrl = remaining.match(/^(https?:\/\/[^\s]+)/);
      if (matchUrl) {
        const url = matchUrl[1];
        parts.push(
          <a
            key={`${lIdx}-${keyIdx++}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-[#00a8fc] hover:underline"
          >
            {url}
          </a>
        );
        remaining = remaining.slice(url.length);
        continue;
      }

      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    }

    if (isQuote) {
      return (
        <div key={lIdx} className="flex gap-2 my-0.5">
          <div className="w-1 bg-[#4e5058] rounded-full shrink-0" />
          <div className="text-sm text-[#dbdee1]">{parts}</div>
        </div>
      );
    }

    return (
      <div key={lIdx} className="text-sm text-[#dbdee1] leading-relaxed min-h-[1.2rem]">
        {parts.length > 0 ? parts : "\u00A0"}
      </div>
    );
  });
}

function EmbedCard({ embed }: { embed: EmbedItem }) {
  const color = embed.color || "#5865F2";

  return (
    <div
      className="rounded overflow-hidden max-w-[520px] bg-[#2b2d31] text-[#dbdee1]"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="p-3">
        {embed.author && (
          <div className="flex items-center gap-2 mb-2">
            {embed.authorIcon && (
              <img
                src={embed.authorIcon}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            )}
            {embed.authorUrl ? (
              <a
                href={embed.authorUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-white hover:underline"
              >
                {embed.author}
              </a>
            ) : (
              <span className="text-xs font-semibold text-white">
                {embed.author}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            {embed.title && (
              <div className="font-semibold text-sm mb-1 text-white">
                {embed.url ? (
                  <a
                    href={embed.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00a8fc] hover:underline"
                  >
                    {embed.title}
                  </a>
                ) : (
                  embed.title
                )}
              </div>
            )}

            {embed.description && (
              <div className="text-xs text-[#dbdee1] mb-2 leading-relaxed">
                {parseMarkdown(embed.description)}
              </div>
            )}

            {embed.fields && embed.fields.length > 0 && (
              <div className="grid grid-cols-12 gap-2 mt-2">
                {embed.fields.map((f) => (
                  <div
                    key={f.id}
                    className={f.inline ? "col-span-4" : "col-span-12"}
                  >
                    <div className="text-xs font-semibold text-white mb-0.5">
                      {f.name}
                    </div>
                    <div className="text-xs text-[#dbdee1] whitespace-pre-wrap">
                      {parseMarkdown(f.value)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {embed.image && (
              <div className="mt-2">
                <img
                  src={embed.image}
                  alt=""
                  className="rounded max-h-[300px] w-auto max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}

            {(embed.footer || embed.timestamp) && (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#949ba4]">
                {embed.footerIcon && (
                  <img
                    src={embed.footerIcon}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                )}
                <span>
                  {embed.footer}
                  {embed.footer && embed.timestamp && " • "}
                  {embed.timestamp &&
                    new Date(embed.timestamp).toLocaleString("en-US", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                </span>
              </div>
            )}
          </div>

          {embed.thumbnail && (
            <div className="shrink-0">
              <img
                src={embed.thumbnail}
                alt=""
                className="w-20 h-20 rounded object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PollPreviewCard({ poll }: { poll: PollConfig }) {
  return (
    <div className="bg-[#2b2d31] rounded-lg max-w-[520px] p-4 border border-[#1f2023] text-white">
      <h4 className="font-semibold text-sm mb-3 text-white">
        {poll.question || "Poll Question"}
      </h4>
      <div className="space-y-2">
        {poll.answers.map((ans, idx) => (
          <div
            key={ans.id}
            className="flex items-center gap-3 p-2.5 bg-[#1e1f22] rounded-md border border-transparent hover:border-[#3f4147] transition-colors"
          >
            <div
              className={`w-4 h-4 border-2 border-[#949ba4] shrink-0 ${
                poll.allowMultiselect ? "rounded-sm" : "rounded-full"
              }`}
            />
            <span className="text-xs text-[#dbdee1]">
              {ans.text || `Answer ${idx + 1}`}
            </span>
          </div>
        ))}
      </div>
      {poll.allowMultiselect && (
        <p className="text-[10px] text-[#949ba4] mt-2">
          Select one or more options
        </p>
      )}
    </div>
  );
}

function InvitePreviewCard({ invite }: { invite: InviteData }) {
  const guild = invite.guild;
  const guildName = guild?.name || `Discord Server (${invite.code})`;
  const iconUrl =
    guild && guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
      : null;

  return (
    <div className="bg-[#2b2d31] rounded-lg p-3.5 max-w-[432px] border border-[#1e1f22] my-2 select-none shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#949ba4] mb-2.5">
        You have been invited to join a server
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#1e1f22] shrink-0 border border-[#35373c] flex items-center justify-center font-bold text-xs text-[#dbdee1]">
            {iconUrl ? (
              <img src={iconUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              guildName.slice(0, 3).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-white truncate leading-tight">
              {guildName}
            </h4>
            <div className="flex items-center gap-3 text-xs text-[#949ba4] mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#23a55a] shrink-0" />
                <span>
                  {(invite.approximate_presence_count ?? 1).toLocaleString()} Online
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#80848e] shrink-0" />
                <span>
                  {(invite.approximate_member_count ?? 1).toLocaleString()} Members
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled
          className="bg-[#248046] text-white text-xs font-semibold px-4 py-2 rounded-[3px] opacity-90 cursor-default shrink-0"
        >
          Join
        </button>
      </div>
    </div>
  );
}

export function DiscordPreview({
  username,
  avatarUrl,
  content = "",
  embeds = [],
  poll,
  files = [],
}: DiscordPreviewProps) {
  const displayName = username && username.trim().length > 0 ? username : "Disco With Me";
  const displayAvatar =
    avatarUrl && avatarUrl.trim().length > 0
      ? avatarUrl
      : "https://cdn.discordapp.com/embed/avatars/0.png";

  const nowFormatted = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const [invites, setInvites] = React.useState<Record<string, InviteData>>({});

  React.useEffect(() => {
    if (!content) return;
    const inviteRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discord(?:app)?\.com\/invite)\/([a-zA-Z0-9-]+)/gi;
    const matches = Array.from(content.matchAll(inviteRegex));
    const codes = Array.from(new Set(matches.map((m) => m[1])));

    codes.forEach((code) => {
      if (invites[code]) return;
      fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`)
        .then((res) => {
          if (!res.ok) throw new Error("Invite fetch failed");
          return res.json();
        })
        .then((data: InviteData) => {
          setInvites((prev) => ({
            ...prev,
            [code]: { ...data, code },
          }));
        })
        .catch(() => {
          setInvites((prev) => ({
            ...prev,
            [code]: {
              code,
              guild: {
                id: "unknown",
                name: `discord.gg/${code}`,
                icon: null,
                description: null,
              },
              approximate_member_count: 0,
              approximate_presence_count: 0,
            },
          }));
        });
    });
  }, [content, invites]);

  const activeInvites = React.useMemo(() => {
    if (!content) return [];
    const inviteRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:discord\.(?:gg|io|me|li)|discord(?:app)?\.com\/invite)\/([a-zA-Z0-9-]+)/gi;
    const matches = Array.from(content.matchAll(inviteRegex));
    const codes = Array.from(new Set(matches.map((m) => m[1])));
    return codes.map((c) => invites[c]).filter(Boolean);
  }, [content, invites]);

  return (
    <div className="bg-[#313338] text-white rounded-lg p-4 font-sans select-none min-h-[140px] border border-[#232428] shadow-inner">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#5865F2] shrink-0">
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://cdn.discordapp.com/embed/avatars/0.png";
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-white hover:underline cursor-pointer">
              {displayName}
            </span>
            <span className="bg-[#5865F2] text-white text-[10px] font-bold px-1 py-0.2 rounded uppercase tracking-wide">
              BOT
            </span>
            <span className="text-[11px] text-[#949ba4]">
              Today at {nowFormatted}
            </span>
          </div>

          {content && content.trim().length > 0 && (
            <div className="mb-2 break-words">{parseMarkdown(content)}</div>
          )}

          {activeInvites.length > 0 && (
            <div className="space-y-2 mb-2">
              {activeInvites.map((inv) => (
                <InvitePreviewCard key={inv.code} invite={inv} />
              ))}
            </div>
          )}

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((file, idx) => {
                const isImage = file.type.startsWith("image/");
                return (
                  <div
                    key={idx}
                    className="p-2 bg-[#2b2d31] rounded border border-[#1f2023] flex items-center gap-2 text-xs text-[#dbdee1]"
                  >
                    {isImage ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-[#1e1f22] flex items-center justify-center font-bold text-[10px]">
                        FILE
                      </div>
                    )}
                    <div className="truncate max-w-[120px]">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-[10px] text-[#949ba4]">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {embeds.length > 0 && (
            <div className="space-y-3 mt-2">
              {embeds.map((emb) => (
                <EmbedCard key={emb.id} embed={emb} />
              ))}
            </div>
          )}

          {poll && poll.enabled && (
            <div className="mt-3">
              <PollPreviewCard poll={poll} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
