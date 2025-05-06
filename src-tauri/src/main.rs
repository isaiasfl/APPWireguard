#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Stdio};
use std::io::Write;
use std::fs;
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct GithubProfile {
    login: String,
    name: Option<String>,
    avatar_url: String,
    html_url: String,
}

#[command]
fn connect_vpn() -> Result<String, String> {
    let output = Command::new("pkexec")
        .arg("wg-quick")
        .arg("up")
        .arg("wg0")
        .output()
        .map_err(|e| format!("Error al ejecutar: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
fn disconnect_vpn() -> Result<String, String> {
    let output = Command::new("pkexec")
        .arg("wg-quick")
        .arg("down")
        .arg("wg0")
        .output()
        .map_err(|e| format!("Error al ejecutar: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
fn read_wg_config() -> Result<String, String> {
    let path = "/etc/wireguard/wg0.conf";
    match fs::read_to_string(path) {
        Ok(content) => Ok(content),
        Err(_) => Ok(String::from("")) // si no existe, devolvemos cadena vacía
    }
}

#[command]
fn save_wg_config(content: String) -> Result<String, String> {
    let cmd = format!("echo \"{}\" | sudo tee /etc/wireguard/wg0.conf", content.replace("\"", "\\\""));
    let output = Command::new("sh")
        .arg("-c")
        .arg(&cmd)
        .output()
        .map_err(|e| format!("Error al guardar: {}", e))?;

    if output.status.success() {
        Ok("Archivo guardado correctamente".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
fn check_wireguard_installed() -> bool {
    Command::new("which")
        .arg("wg")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[command]
fn generate_keys() -> Result<(String, String), String> {
    let private_output = Command::new("wg")
        .arg("genkey")
        .output()
        .map_err(|e| e.to_string())?;

    let private_key = String::from_utf8_lossy(&private_output.stdout).trim().to_string();

    let mut child = Command::new("wg")
        .arg("pubkey")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    {
        let stdin = child.stdin.as_mut().ok_or("Error accediendo al stdin")?;
        stdin.write_all(private_key.as_bytes()).map_err(|e| e.to_string())?;
    }

    let output = child.wait_with_output().map_err(|e| e.to_string())?;
    let public_key = String::from_utf8_lossy(&output.stdout).trim().to_string();

    Ok((private_key, public_key))
}

#[command]
fn get_username() -> String {
    std::env::var("USER").unwrap_or_else(|_| "Desconocido".into())
}

#[command]
fn get_hostname() -> String {
    Command::new("hostname")
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).trim().to_string())
        .unwrap_or_else(|_| "Desconocido".to_string())
}

#[command]
fn get_ip_address() -> String {
    Command::new("sh")
        .arg("-c")
        .arg("ip route get 1.1.1.1 | awk '{print $7}'")
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).trim().to_string())
        .unwrap_or_else(|_| "Desconocida".to_string())
}

#[command]
fn get_os_info() -> String {
    Command::new("sh")
        .arg("-c")
        .arg("grep PRETTY_NAME /etc/os-release | cut -d= -f2")
        .output()
        .map(|output| {
            String::from_utf8_lossy(&output.stdout)
                .replace('"', "")
                .trim()
                .to_string()
        })
        .unwrap_or_else(|_| "Desconocido".to_string())
}

#[command]
fn get_dns_servers() -> String {
    match Command::new("systemd-resolve")
        .arg("--status")
        .output()
    {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let mut dns_lines = vec![];

            for line in stdout.lines() {
                if line.trim_start().starts_with("DNS Servers:") {
                    dns_lines.push(line.trim().replace("DNS Servers:", "").trim().to_string());
                }
            }

            dns_lines.join(", ")
        },
        Err(_) => "No disponible".to_string()
    }
}

#[command]
async fn get_github_info() -> Result<GithubProfile, String> {
    let url = "https://api.github.com/users/isaiasfl";
    let client = reqwest::Client::new();

    let res = client
        .get(url)
        .header("User-Agent", "tauri-app")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<GithubProfile>()
        .await
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            connect_vpn,
            disconnect_vpn,
            read_wg_config,
            save_wg_config,
            check_wireguard_installed,
            generate_keys,
            get_username,
            get_hostname,
            get_ip_address,
            get_os_info,
            get_dns_servers,
            get_github_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
