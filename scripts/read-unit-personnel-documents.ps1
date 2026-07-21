$ErrorActionPreference = "Stop"

function Get-XlsxRows([string]$path) {
  Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction SilentlyContinue
  $zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $path))
  try {
    $shared = @()
    $sharedEntry = $zip.GetEntry("xl/sharedStrings.xml")
    if ($sharedEntry) {
      $reader = New-Object System.IO.StreamReader($sharedEntry.Open())
      [xml]$sharedXml = $reader.ReadToEnd()
      $reader.Close()
      $nsShared = New-Object System.Xml.XmlNamespaceManager($sharedXml.NameTable)
      $nsShared.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")
      foreach ($si in $sharedXml.SelectNodes("//x:si", $nsShared)) {
        $shared += (($si.InnerText -replace "\s+", " ").Trim())
      }
    }

    $sheetEntry = $zip.GetEntry("xl/worksheets/sheet1.xml")
    $reader = New-Object System.IO.StreamReader($sheetEntry.Open())
    [xml]$sheetXml = $reader.ReadToEnd()
    $reader.Close()
    $nsSheet = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
    $nsSheet.AddNamespace("x", "http://schemas.openxmlformats.org/spreadsheetml/2006/main")

    $rows = @()
    foreach ($row in $sheetXml.SelectNodes("//x:sheetData/x:row", $nsSheet)) {
      $cells = @{}
      foreach ($cell in $row.SelectNodes("x:c", $nsSheet)) {
        $ref = $cell.GetAttribute("r")
        $col = ($ref -replace "\d", "")
        $valueNode = $cell.SelectSingleNode("x:v", $nsSheet)
        $value = if ($valueNode) { $valueNode.InnerText } else { "" }
        if ($cell.GetAttribute("t") -eq "s" -and $value -ne "") {
          $value = $shared[[int]$value]
        } elseif ($cell.GetAttribute("t") -eq "inlineStr") {
          $value = $cell.InnerText
        }
        $cells[$col] = (($value -replace "\s+", " ").Trim())
      }

      $rows += [pscustomobject]@{
        rowNumber = [int]$row.GetAttribute("r")
        A = if ($cells.ContainsKey("A")) { $cells["A"] } else { "" }
        B = if ($cells.ContainsKey("B")) { $cells["B"] } else { "" }
        C = if ($cells.ContainsKey("C")) { $cells["C"] } else { "" }
        D = if ($cells.ContainsKey("D")) { $cells["D"] } else { "" }
        E = if ($cells.ContainsKey("E")) { $cells["E"] } else { "" }
        F = if ($cells.ContainsKey("F")) { $cells["F"] } else { "" }
        G = if ($cells.ContainsKey("G")) { $cells["G"] } else { "" }
        H = if ($cells.ContainsKey("H")) { $cells["H"] } else { "" }
      }
    }

    return $rows
  } finally {
    $zip.Dispose()
  }
}

function Convert-ExcelDate([string]$value) {
  if ($value -match "^\d+(\.\d+)?$") {
    $number = [double]$value
    if ($number -gt 30000 -and $number -lt 60000) {
      return [DateTime]::FromOADate($number).ToString("dd-MM-yyyy")
    }
  }
  return $value
}

function Split-RankNrp([string]$value) {
  $parts = $value -split "/", 2
  $left = $parts[0].Trim()
  $nrp = if ($parts.Count -gt 1) { $parts[1].Trim().TrimStart("'") } else { "" }
  $tokens = $left -split "\s+", 2
  $rank = if ($tokens.Count -ge 1) { $tokens[0].Trim() } else { "" }
  $corps = if ($tokens.Count -ge 2) { $tokens[1].Trim() } else { "" }
  return [pscustomobject]@{ pangkat = $rank; korps = $corps; nrpNip = $nrp }
}

function Test-NumberText([string]$value) {
  return $value -match "^\d+$"
}

function Parse-SimplePersonnel([string]$path) {
  $rows = Get-XlsxRows $path
  $result = @()
  foreach ($row in $rows) {
    if (-not (Test-NumberText $row.A)) { continue }
    $rankNrp = Split-RankNrp $row.C
    $result += ,@(
      [string]$row.A,
      [string]$row.B,
      [string]$rankNrp.pangkat,
      [string]$rankNrp.korps,
      [string]$rankNrp.nrpNip,
      [string]$row.D,
      "",
      "",
      "",
      [string]$row.E
    )
  }
  return ,$result
}

function Parse-PairedPersonnel([string]$path) {
  $rows = Get-XlsxRows $path
  $rowByNumber = @{}
  foreach ($row in $rows) { $rowByNumber[$row.rowNumber] = $row }
  $result = @()
  foreach ($row in $rows) {
    if (-not (Test-NumberText $row.A)) { continue }
    $next = $rowByNumber[$row.rowNumber + 1]
    $jabatan = if ($row.G) { $row.G } else { $row.F }
    $jawatan = if ($next -and $next.G) { $next.G } elseif ($next) { $next.F } else { "" }
    $ttl = if ($next) { [string]$next.B } else { "" }
    $pangkatTmt = if ($next) { Convert-ExcelDate ([string]$next.C) } else { "" }
    $jurusan = if ($next) { [string]$next.D } else { "" }
    $result += ,@(
      [string]$row.A,
      [string]$row.B,
      [string]$row.C,
      [string]$row.D,
      ([string]$row.E).TrimStart("'"),
      [string]$jabatan,
      $ttl,
      $pangkatTmt,
      $jurusan,
      [string]$jawatan
    )
  }
  return ,$result
}

$documentsDir = Join-Path (Split-Path -Parent $PSScriptRoot) "public\documents"
$organizationFiles = [ordered]@{
  perwira = "Data_Personel_Perwira.xlsx"
  bintara = "Data_Personel_Bintara.xlsx"
  tamtama = "Data_Personel_Tamtama.xlsx"
  pns = "Data_Personel_PNS.xlsx"
}

$unitSpecs = [ordered]@{
  "401-tkt" = [ordered]@{ parser = "simple"; files = [ordered]@{ perwira = "DAFTAR PERSONEL PERWIRA SATRAD 401 TKT.xlsx"; bintara = "DAFTAR PERSONEL BINTARA SATRAD 401 TKT.xlsx"; tamtama = "DAFTAR PERSONEL TAMTAMA SATRAD 401 TKT.xlsx" } }
  "402-cbl" = [ordered]@{ parser = "paired"; files = [ordered]@{ perwira = "Perwira_Satrad_402.xlsx"; bintara = "Bintara_Satrad_402.xlsx"; tamtama = "Tamtama_Satrad_402.xlsx" } }
  "403-tgl" = [ordered]@{ parser = "paired"; files = [ordered]@{ perwira = "Perwira 403.xlsx"; bintara = "Bintara 403.xlsx"; tamtama = "Tamtama 403.xlsx" } }
  "421-tga" = [ordered]@{ parser = "simple"; files = [ordered]@{ perwira = "DAFTAR PERSONEL PERWIRA SATRUDAL.xlsx"; bintara = "DAFTAR PERSONEL BINTARA SATRUDAL.xlsx"; tamtama = "DAFTAR PERSONEL TAMTAMA SATRUDAL.xlsx" } }
  "404-cgt" = [ordered]@{ parser = "paired"; files = [ordered]@{ perwira = "Data Personel Perwira Satrad 404.xlsx"; bintara = "Data Personel Bintara Satrad 404.xlsx"; tamtama = "Data Personel Tamtama Satrad 404.xlsx" } }
}

$output = @()
foreach ($categorySlug in $organizationFiles.Keys) {
  $fileName = $organizationFiles[$categorySlug]
  $filePath = Join-Path $documentsDir $fileName
  if (-not (Test-Path -LiteralPath $filePath)) {
    continue
  }
  $output += [pscustomobject]@{
    tableKey = "personnel-$categorySlug"
    rowKeyPrefix = "$categorySlug-"
    categorySlug = $categorySlug
    fileName = $fileName
    rows = Parse-PairedPersonnel $filePath
  }
}

foreach ($unitSlug in $unitSpecs.Keys) {
  $spec = $unitSpecs[$unitSlug]
  foreach ($categorySlug in $spec.files.Keys) {
    $fileName = $spec.files[$categorySlug]
    $filePath = Join-Path $documentsDir $fileName
    if (-not (Test-Path -LiteralPath $filePath)) {
      continue
    }
    $rows = if ($spec.parser -eq "simple") {
      Parse-SimplePersonnel $filePath
    } else {
      Parse-PairedPersonnel $filePath
    }
    $output += [pscustomobject]@{
      tableKey = "unit:${unitSlug}:personel:${categorySlug}"
      rowKeyPrefix = "${unitSlug}-${categorySlug}-"
      unitSlug = $unitSlug
      categorySlug = $categorySlug
      fileName = $fileName
      rows = $rows
    }
  }
}

$output | ConvertTo-Json -Depth 8
