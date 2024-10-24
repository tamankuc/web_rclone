export const config = [
    {
        "Name": "local",
        "Description": "Local Disk",
        "Prefix": "local",
        "Options": [
            {
                "Name": "nounc",
                "Help": "Disable UNC (long path names) conversion on Windows",
                "Provider": "",
                "Default": "",
                "Value": null,
                "Examples": [
                    {
                        "Value": "true",
                        "Help": "Disables long file names",
                        "Provider": ""
                    }
                ],
                "ShortOpt": "",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": false,
                "Advanced": false
            },
            {
                "Name": "copy_links",
                "Help": "Follow symlinks and copy the pointed to item.",
                "Provider": "",
                "Default": false,
                "Value": null,
                "ShortOpt": "L",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": true,
                "Advanced": true
            },
            {
                "Name": "links",
                "Help": "Translate symlinks to/from regular files with a '.rclonelink' extension",
                "Provider": "",
                "Default": false,
                "Value": null,
                "ShortOpt": "l",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": true,
                "Advanced": true
            },
            {
                "Name": "skip_links",
                "Help": "Don't warn about skipped symlinks.\nThis flag disables warning messages on skipped symlinks or junction\npoints, as you explicitly acknowledge that they should be skipped.",
                "Provider": "",
                "Default": false,
                "Value": null,
                "ShortOpt": "",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": true,
                "Advanced": true
            },
            {
                "Name": "no_unicode_normalization",
                "Help": "Don't apply unicode normalization to paths and filenames (Deprecated)\n\nThis flag is deprecated now.  Rclone no longer normalizes unicode file\nnames, but it compares them with unicode normalization in the sync\nroutine instead.",
                "Provider": "",
                "Default": false,
                "Value": null,
                "ShortOpt": "",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": false,
                "Advanced": true
            },
            {
                "Name": "no_check_updated",
                "Help": "Don't check to see if the files change during upload\n\nNormally rclone checks the size and modification time of files as they\nare being uploaded and aborts with a message which starts \"can't copy\n- source file is being updated\" if the file changes during upload.\n\nHowever on some file systems this modification time check may fail (eg\n[Glusterfs #2206](https://github.com/ncw/rclone/issues/2206)) so this\ncheck can be disabled with this flag.",
                "Provider": "",
                "Default": false,
                "Value": null,
                "ShortOpt": "",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": false,
                "Advanced": true
            },
            {
                "Name": "one_file_system",
                "Help": "Don't cross filesystem boundaries (unix/macOS only).",
                "Provider": "",
                "Default": false,
                "Value": null,
                "ShortOpt": "x",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": true,
                "Advanced": true
            }
        ]
    },
    {
        "Name": "webdav",
        "Description": "Webdav",
        "Prefix": "webdav",
        "Options": [
            {
                "Name": "url",
                "Help": "URL of http host to connect to",
                "Provider": "",
                "Default": "",
                "Value": null,
                "Examples": [
                    {
                        "Value": "https://example.com",
                        "Help": "Connect to example.com",
                        "Provider": ""
                    }
                ],
                "ShortOpt": "",
                "Hide": 0,
                "Required": true,
                "IsPassword": false,
                "NoPrefix": false,
                "Advanced": false
            },
            {
                "Name": "vendor",
                "Help": "Name of the Webdav site/service/software you are using",
                "Provider": "",
                "Default": "",
                "Value": null,
                "Examples": [
                    {
                        "Value": "nextcloud",
                        "Help": "Nextcloud",
                        "Provider": ""
                    },
                    {
                        "Value": "owncloud",
                        "Help": "Owncloud",
                        "Provider": ""
                    },
                    {
                        "Value": "sharepoint",
                        "Help": "Sharepoint",
                        "Provider": ""
                    },
                    {
                        "Value": "other",
                        "Help": "Other site/service or software",
                        "Provider": ""
                    }
                ],
                "ShortOpt": "",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": false,
                "Advanced": false
            },
            {
                "Name": "user",
                "Help": "User name",
                "Provider": "",
                "Default": "",
                "Value": null,
                "ShortOpt": "",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": false,
                "Advanced": false
            },
            {
                "Name": "pass",
                "Help": "Password.",
                "Provider": "",
                "Default": "",
                "Value": null,
                "ShortOpt": "",
                "Hide": 0,
                "Required": false,
                "IsPassword": true,
                "NoPrefix": false,
                "Advanced": false
            },
            {
                "Name": "bearer_token",
                "Help": "Bearer token instead of user/pass (eg a Macaroon)",
                "Provider": "",
                "Default": "",
                "Value": null,
                "ShortOpt": "",
                "Hide": 0,
                "Required": false,
                "IsPassword": false,
                "NoPrefix": false,
                "Advanced": false
            }
        ]
    }
];
