import React, { useState, ReactNode } from "react";
import { Box, Typography, TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export type LogEntry = {
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: string;
};

interface DeployLogsProps {
  logs: LogEntry[];
}

const logIconMap: Record<LogEntry["type"], ReactNode> = {
  info: <InfoIcon fontSize="small" color="inherit" />,
  warning: <WarningIcon fontSize="small" color="warning" />,
  error: <ErrorIcon fontSize="small" color="error" />,
  success: <CheckCircleIcon fontSize="small" color="success" />,
};

const DeployLogs: React.FC<DeployLogsProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logs based on search term
  const filteredLogs = logs.filter(
    (log) =>
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.timestamp.includes(searchTerm)
  );

  // Copy logs to clipboard
  const handleCopy = () => {
    const text = filteredLogs.map((log) => `${log.timestamp} - ${log.message}`).join("\n");
    navigator.clipboard.writeText(text);
  };

  // Download logs as text file
  const handleDownload = () => {
    const blob = new Blob(
      [filteredLogs.map((log) => `${log.timestamp} - ${log.message}`).join("\n")],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "deploy-logs.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ border: "1px solid #eaeaea", borderRadius: 1, overflow: "hidden", mb: 3 }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #eaeaea",
          backgroundColor: "#fafafa",
        }}
      >
        <TextField
          placeholder="Filter logs"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            flex: 1,
            mr: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 1 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <IconButton size="small" onClick={handleCopy}>
          <ContentCopyIcon />
        </IconButton>
        <IconButton size="small" onClick={handleDownload}>
          <DownloadIcon />
        </IconButton>
      </Box>

      {/* Logs Container */}
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          fontFamily: "Menlo, monospace",
          fontSize: "0.875rem",
          backgroundColor: "#fff",
          maxHeight: 400,
          overflow: "auto",
        }}
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, idx) => (
            <Box key={idx} sx={{ display: "flex", mb: 1 }}>
              {/* Timestamp */}
              <Box sx={{ width: 80, color: "#999", flexShrink: 0 }}>
                {log.timestamp}
              </Box>
              {/* Message */}
              <Box sx={{ display: "flex", alignItems: "center", color: "#333" }}>
                {logIconMap[log.type]}
                <Typography component="span" sx={{ ml: 1 }}>
                  {log.message}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Typography sx={{ p: 2, textAlign: "center", color: "#999" }}>
            No logs found.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DeployLogs;
