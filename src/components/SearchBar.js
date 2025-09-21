import React, { useState } from "react";
import { Autocomplete, TextField, Button, Stack, Typography } from "@mui/material";
import axios from "../api";
import EditModal from "./EditModal";

export default function SearchBar({ photos, setPhotos, setLoading, onUpdated }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [openUpload, setOpenUpload] = useState(false); // upload modal state

  const fetchSuggestions = (input) => {
    if (!input) {
      setOptions([]);
      return;
    }
    axios
      .get("/photos/suggestions", { params: { q: input } })
      .then((res) => setOptions(res.data))
      .catch((err) => console.error(err));
  };

  const doSearch = (value) => {
    if (!value.trim()) {
      setLoading(true);
      axios
        .get("/photos")
        .then((res) => setPhotos(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
      return;
    }

    setLoading(true);
    axios
      .get("/photos/search", { params: { q: value } })
      .then((res) => setPhotos(res.data))
      .catch(() => alert("Search failed"))
      .finally(() => setLoading(false));
  };

  return (
    <>
        <Stack direction="row" spacing={2} mb={3}>
            <Autocomplete
                freeSolo
                options={options}
                inputValue={query}
                onInputChange={(event, newInputValue) => {
                    setQuery(newInputValue);
                    fetchSuggestions(newInputValue);
                }}
                onChange={(event, newValue) => {
                    if (newValue) doSearch(newValue);
                }}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    placeholder="Search by tag, description, filename..."
                    variant="outlined"
                    fullWidth
                    sx={{ bgcolor: "white", borderRadius: 1 }}
                    />
                )}
                sx={{ flexGrow: 1, minWidth: 200 }}
                />

            <Stack direction="row" spacing={1}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => doSearch(query)}
                    sx={{ borderRadius: 2, minWidth: 100 }}
                >
                    Search
                </Button>

                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setOpenUpload(true)}
                    sx={{ borderRadius: 2, minWidth: 100 }}
                >
                    Upload
                </Button>
            </Stack>
        </Stack>

        {photos.length === 0 && query && (
            <Typography variant="body2" color="text.secondary" align="center">
                No results found
            </Typography>
        )}

        {openUpload && (
            <EditModal
                openPopup={openUpload}
                photo={{ id: 0, url: "", tags: [], description: "" }}
                onClose={() => {
                    setOpenUpload(false);
                    onUpdated && onUpdated();
                }}
            />
        )}
    </>
  );
}
