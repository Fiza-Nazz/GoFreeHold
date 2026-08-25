/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: gofreehold
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Current Database: `gofreehold`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `gofreehold` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `gofreehold`;

--
-- Table structure for table `appliances`
--

DROP TABLE IF EXISTS `appliances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `appliances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `serial_number` varchar(255) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appliances_unit_id_foreign` (`unit_id`),
  CONSTRAINT `appliances_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appliances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `appliances` WRITE;
/*!40000 ALTER TABLE `appliances` DISABLE KEYS */;
/*!40000 ALTER TABLE `appliances` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `bank`
--

DROP TABLE IF EXISTS `bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `bank` WRITE;
/*!40000 ALTER TABLE `bank` DISABLE KEYS */;
INSERT INTO `bank` VALUES
(1,'Emirates NBD','2026-08-21 22:59:27','2026-08-21 22:59:27');
/*!40000 ALTER TABLE `bank` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_accounts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bank_id` bigint(20) unsigned DEFAULT NULL,
  `account_name` varchar(255) NOT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `iban` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bank_accounts_bank_id_foreign` (`bank_id`),
  CONSTRAINT `bank_accounts_bank_id_foreign` FOREIGN KEY (`bank_id`) REFERENCES `bank` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_accounts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `bank_accounts` WRITE;
/*!40000 ALTER TABLE `bank_accounts` DISABLE KEYS */;
INSERT INTO `bank_accounts` VALUES
(2,1,'GoFreeHold Real Estate Trust A/C','1029384756','AE2902600001029384756','Downtown Dubai Branch','2026-08-21 22:59:27','2026-08-21 22:59:27');
/*!40000 ALTER TABLE `bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `booking_cash_receipts`
--

DROP TABLE IF EXISTS `booking_cash_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_cash_receipts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned NOT NULL,
  `receipt_number` varchar(255) NOT NULL,
  `tenant_name` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `receipt_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `recorded_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_cash_receipts_receipt_number_unique` (`receipt_number`),
  KEY `booking_cash_receipts_recorded_by_foreign` (`recorded_by`),
  KEY `booking_cash_receipts_unit_id_receipt_date_index` (`unit_id`,`receipt_date`),
  CONSTRAINT `booking_cash_receipts_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `booking_cash_receipts_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_cash_receipts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `booking_cash_receipts` WRITE;
/*!40000 ALTER TABLE `booking_cash_receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_cash_receipts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `call_logs`
--

DROP TABLE IF EXISTS `call_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `call_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `remark` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `logged_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contract_call_logs_contract_id_foreign` (`contract_id`),
  KEY `contract_call_logs_logged_by_foreign` (`logged_by`),
  CONSTRAINT `contract_call_logs_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contract_call_logs_logged_by_foreign` FOREIGN KEY (`logged_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `call_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `call_logs` WRITE;
/*!40000 ALTER TABLE `call_logs` DISABLE KEYS */;
INSERT INTO `call_logs` VALUES
(1,20,'Tenant confirmed handover scheduled for 25 Aug 2026.','2026-08-22',1,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(2,22,'Tenant confirmed handover scheduled for 25 Aug 2026.','2026-08-22',1,'2026-08-21 22:59:26','2026-08-21 22:59:26');
/*!40000 ALTER TABLE `call_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'expense',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(1,'Operations Income','income','2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,'Operations Expense','expense','2026-08-10 04:22:38','2026-08-10 04:22:38');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned DEFAULT NULL,
  `unit_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','assigned','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `assigned_to` bigint(20) unsigned DEFAULT NULL,
  `priority` enum('low','medium','high','emergency') NOT NULL DEFAULT 'medium',
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `complaints_unit_id_foreign` (`unit_id`),
  KEY `complaints_assigned_to_foreign` (`assigned_to`),
  KEY `complaints_tenant_id_foreign` (`tenant_id`),
  CONSTRAINT `complaints_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `complaints_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `complaints_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES
(1,1,1,'AC not cooling','Bedroom AC weak','resolved',2,'high',NULL,'2026-08-10 04:22:38','2026-08-11 08:09:07'),
(2,1,1,'pipe leakage','pipe leakage in the kicthen','resolved',2,'medium',NULL,'2026-08-11 08:11:55','2026-08-16 14:59:29'),
(3,1,1,'kitchen\'s sink leakage','kitchen\'s sink is leakage','resolved',2,'medium',NULL,'2026-08-16 09:16:32','2026-08-16 14:59:34'),
(4,1,1,'electricity not availabe','electricity is not available','resolved',2,'medium',NULL,'2026-08-16 14:58:30','2026-08-16 14:59:32'),
(5,1,1,'AC Compressor Leaking in 502','Air conditioner is blowing warm air and dripping','in_progress',2,'high',NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44'),
(6,1,1,'Bathroom Sink Drainage Clogged','Water draining very slowly in master bathroom','in_progress',2,'medium','2026-08-17 07:57:44','2026-08-17 07:57:44','2026-08-20 11:48:43'),
(7,1,1,'Intercom Handset Not Ringing','Visitors at main gate cannot ring apartment','resolved',2,'low',NULL,'2026-08-17 07:57:44','2026-08-20 11:49:24'),
(8,1,1,'Main Door Electronic Lock Jammed','Keypad code not unlocking door on 2nd floor','resolved',2,'high',NULL,'2026-08-17 07:57:44','2026-08-20 11:49:19'),
(9,1,1,'Deep Test: Water Leakage in Bathroom','Water is leaking from the bathroom pipe since 2 days.','resolved',NULL,'high',NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(10,1,1,'Deep Test: Water Leakage in Bathroom','Water is leaking from the bathroom pipe since 2 days.','resolved',NULL,'high',NULL,'2026-08-21 12:22:07','2026-08-21 12:22:07'),
(11,1,1,'Deep Test: Water Leakage in Bathroom','Water is leaking from the bathroom pipe since 2 days.','resolved',NULL,'high',NULL,'2026-08-21 12:27:58','2026-08-21 12:27:58'),
(12,1,1,'Deep Test: Water Leakage in Bathroom','Water is leaking from the bathroom pipe since 2 days.','resolved',NULL,'high',NULL,'2026-08-21 12:28:56','2026-08-21 12:28:56'),
(13,1,20,'Chiller AC thermostat not responding','Thermostat is showing error code E4 on master bedroom AC.','resolved',NULL,'medium',NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(14,1,22,'Chiller AC thermostat not responding','Thermostat is showing error code E4 on master bedroom AC.','resolved',NULL,'medium',NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(15,1,24,'Chiller AC thermostat not responding','Thermostat is showing error code E4 on master bedroom AC.','resolved',NULL,'medium',NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(16,1,1,'Water pressure low in master bathroom','Water flow from shower head is very slow since yesterday evening.','open',NULL,'medium',NULL,'2026-08-21 23:09:54','2026-08-21 23:09:54'),
(17,1,1,'Water heater thermostat failure','Thermostat tripped safety valve in bathroom.','resolved',2,'high',NULL,'2026-08-21 23:12:49','2026-08-21 23:12:49'),
(18,1,1,'Water heater thermostat failure','Thermostat tripped safety valve in bathroom.','resolved',2,'high',NULL,'2026-08-21 23:13:23','2026-08-21 23:13:23');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contract_case_docs`
--

DROP TABLE IF EXISTS `contract_case_docs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_case_docs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contract_case_docs_contract_id_foreign` (`contract_id`),
  CONSTRAINT `contract_case_docs_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_case_docs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contract_case_docs` WRITE;
/*!40000 ALTER TABLE `contract_case_docs` DISABLE KEYS */;
/*!40000 ALTER TABLE `contract_case_docs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contract_cheques`
--

DROP TABLE IF EXISTS `contract_cheques`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_cheques` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `cheque_number` varchar(255) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('pending','cleared','bounced') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pdc_cheques_contract_id_foreign` (`contract_id`),
  CONSTRAINT `pdc_cheques_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_cheques`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contract_cheques` WRITE;
/*!40000 ALTER TABLE `contract_cheques` DISABLE KEYS */;
INSERT INTO `contract_cheques` VALUES
(1,1,'CHQ-1001','Emirates NBD',15000.00,'2026-08-15','pending','2026-08-10 04:22:38','2026-08-10 04:22:38',NULL),
(2,2,'CHQ-1002','ADCB',20000.00,'2026-08-13','pending','2026-08-10 04:22:38','2026-08-10 04:22:38',NULL),
(3,2,'CHQ-165874','Emirates NBD',20000.00,'2026-09-02','cleared','2026-08-18 02:56:41','2026-08-18 02:56:41','First installment PDC'),
(4,2,'CHQ-BOUNCE-4303','Dubai Islamic Bank',15000.00,'2026-08-18','bounced','2026-08-18 02:56:41','2026-08-18 02:56:41','Replaced by #CHQ-REPLACE-6453'),
(5,2,'CHQ-REPLACE-6453','Mashreq Bank',15000.00,'2026-08-25','bounced','2026-08-18 02:56:41','2026-08-21 11:21:55','Replacement for bounced cheque #CHQ-BOUNCE-4303'),
(6,12,'CHQ-88201','Emirates NBD',30000.00,'2026-10-01','pending','2026-08-21 11:53:59','2026-08-21 11:53:59',NULL),
(7,12,'CHQ-88202','Emirates NBD',30000.00,'2027-01-01','pending','2026-08-21 11:53:59','2026-08-21 11:53:59',NULL),
(8,12,'CHQ-88203','Emirates NBD',30000.00,'2027-04-01','pending','2026-08-21 11:53:59','2026-08-21 11:53:59',NULL),
(9,12,'CHQ-88204','Emirates NBD',30000.00,'2027-07-01','pending','2026-08-21 11:53:59','2026-08-21 11:53:59',NULL),
(10,18,'CHQ-501101','Dubai Islamic Bank',23750.00,'2026-09-01','cleared','2026-08-21 22:54:31','2026-08-21 22:54:31',NULL),
(11,18,'CHQ-501102','Dubai Islamic Bank',23750.00,'2026-12-01','pending','2026-08-21 22:54:31','2026-08-21 22:54:31',NULL),
(12,18,'CHQ-501103','Dubai Islamic Bank',23750.00,'2027-03-01','pending','2026-08-21 22:54:31','2026-08-21 22:54:31',NULL),
(13,18,'CHQ-501104','Dubai Islamic Bank',23750.00,'2027-06-01','pending','2026-08-21 22:54:31','2026-08-21 22:54:31',NULL),
(14,20,'CHQ-501101','Dubai Islamic Bank',23750.00,'2026-09-01','cleared','2026-08-21 22:55:28','2026-08-21 22:55:28',NULL),
(15,20,'CHQ-501102','Dubai Islamic Bank',23750.00,'2026-12-01','pending','2026-08-21 22:55:28','2026-08-21 22:55:28',NULL),
(16,20,'CHQ-501103','Dubai Islamic Bank',23750.00,'2027-03-01','pending','2026-08-21 22:55:28','2026-08-21 22:55:28',NULL),
(17,20,'CHQ-501104','Dubai Islamic Bank',23750.00,'2027-06-01','pending','2026-08-21 22:55:28','2026-08-21 22:55:28',NULL),
(18,22,'CHQ-501101','Dubai Islamic Bank',23750.00,'2026-09-01','cleared','2026-08-21 22:59:26','2026-08-21 22:59:26',NULL),
(19,22,'CHQ-501102','Dubai Islamic Bank',23750.00,'2026-12-01','pending','2026-08-21 22:59:26','2026-08-21 22:59:26',NULL),
(20,22,'CHQ-501103','Dubai Islamic Bank',23750.00,'2027-03-01','pending','2026-08-21 22:59:26','2026-08-21 22:59:26',NULL),
(21,22,'CHQ-501104','Dubai Islamic Bank',23750.00,'2027-06-01','pending','2026-08-21 22:59:26','2026-08-21 22:59:26',NULL);
/*!40000 ALTER TABLE `contract_cheques` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contract_docs`
--

DROP TABLE IF EXISTS `contract_docs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_docs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contract_docs_contract_id_foreign` (`contract_id`),
  CONSTRAINT `contract_docs_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_docs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contract_docs` WRITE;
/*!40000 ALTER TABLE `contract_docs` DISABLE KEYS */;
/*!40000 ALTER TABLE `contract_docs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contract_payables`
--

DROP TABLE IF EXISTS `contract_payables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_payables` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `due_date` date DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contract_payables_contract_id_foreign` (`contract_id`),
  CONSTRAINT `contract_payables_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_payables`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contract_payables` WRITE;
/*!40000 ALTER TABLE `contract_payables` DISABLE KEYS */;
/*!40000 ALTER TABLE `contract_payables` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned NOT NULL,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `owner_id` bigint(20) unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `rent_amount` decimal(10,2) NOT NULL,
  `lease_term` varchar(255) DEFAULT NULL,
  `security_deposit` decimal(12,2) NOT NULL,
  `deposit_type` varchar(255) DEFAULT NULL,
  `dewa_deposit` decimal(12,2) DEFAULT NULL,
  `due` decimal(12,2) NOT NULL DEFAULT 0.00,
  `on_case` tinyint(1) NOT NULL DEFAULT 0,
  `type` varchar(255) NOT NULL DEFAULT 'residential',
  `notes` text DEFAULT NULL,
  `status` enum('active','expired','vacated','settled') NOT NULL DEFAULT 'active',
  `last_renewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `tenant_id_image` varchar(255) DEFAULT NULL,
  `owner_id_image` varchar(255) DEFAULT NULL,
  `mode_of_payment` varchar(255) DEFAULT NULL,
  `contract_value` decimal(12,2) DEFAULT NULL,
  `passport_image` varchar(255) DEFAULT NULL,
  `visa_page` varchar(255) DEFAULT NULL,
  `tenant_id_back_image` varchar(255) DEFAULT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `discount_info` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contracts_unit_id_foreign` (`unit_id`),
  KEY `contracts_tenant_id_foreign` (`tenant_id`),
  KEY `contracts_owner_id_foreign` (`owner_id`),
  CONSTRAINT `contracts_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contracts_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
INSERT INTO `contracts` VALUES
(1,1,1,1,'2026-02-10','2026-02-10','2027-02-10','2026-08-01',50000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential','nothing just i want Vacate Contract','vacated',NULL,'2026-08-10 04:22:38','2026-08-16 15:17:14',NULL,NULL,'cheque',NULL,NULL,NULL,NULL,NULL,NULL),
(2,3,2,1,'2025-09-10','2025-09-10','2026-08-15','2026-08-01',80000.00,NULL,5000.00,NULL,NULL,0.00,1,'residential',NULL,'active',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,NULL,'bank_transfer',NULL,NULL,NULL,NULL,NULL,NULL),
(3,5,3,2,'2025-08-10','2025-08-10','2026-07-31','2026-07-31',120000.00,'12 months',12000.00,NULL,NULL,0.00,0,'residential',NULL,'expired',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(4,7,2,1,'2025-03-15','2025-03-15','2026-03-14',NULL,130000.00,'11',10833.00,NULL,NULL,0.00,0,'residential','1 Year lease - 3BR Al Barsha 1001 - Samira Malik','active',NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL,NULL,'quarterly',130000.00,NULL,NULL,NULL,NULL,NULL),
(5,9,5,1,NULL,'2025-01-01','2026-12-31',NULL,85000.00,NULL,7083.00,NULL,NULL,0.00,0,'residential','2 Year lease - Al Barsha 502 - Ahmed Al Farsi','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'monthly',85000.00,NULL,NULL,NULL,NULL,NULL),
(6,10,6,1,NULL,'2025-03-15','2026-03-14',NULL,130000.00,NULL,10833.00,NULL,NULL,0.00,0,'residential','1 Year lease - 3BR Al Barsha 1001 - Samira Malik','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'quarterly',130000.00,NULL,NULL,NULL,NULL,NULL),
(7,12,7,2,NULL,'2025-06-01','2027-05-31',NULL,220000.00,NULL,18333.00,NULL,NULL,0.00,0,'commercial','2 Year commercial - DIFC B101 - Raj Kumar Patel','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'yearly',220000.00,NULL,NULL,NULL,NULL,NULL),
(8,14,8,3,NULL,'2024-09-01','2025-08-31',NULL,95000.00,NULL,7917.00,NULL,NULL,0.00,0,'residential','Expired - Jumeirah J01 - Elena Torres','expired',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'monthly',95000.00,NULL,NULL,NULL,NULL,NULL),
(9,15,9,3,NULL,'2025-08-01','2026-07-31',NULL,140000.00,NULL,11667.00,NULL,NULL,0.00,0,'residential','1 Year - Jumeirah J02 - James Osei','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'quarterly',140000.00,NULL,NULL,NULL,NULL,NULL),
(10,18,5,1,NULL,'2025-10-01','2026-09-30',NULL,55000.00,NULL,4583.00,NULL,NULL,0.00,0,'residential','1 Year - Sports City SC201 - Ahmed Al Farsi','active',NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL,NULL,'monthly',55000.00,NULL,NULL,NULL,NULL,NULL),
(11,1,1,1,'2026-08-21','2026-09-01','2027-08-31',NULL,60000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential','Tenant requested 2 keys and 1 parking card.','active',NULL,'2026-08-21 11:53:59','2026-08-21 12:04:34','contracts/QJEjZ0eA4YycDL6kp8hKcWyTQ9vX9ly7fzNywX0W.jpg',NULL,'Cash',60000.00,'contracts/LLvNDeHwr8rYQX3Y9htPNdTLIxYhql67i0FsW7dp.jpg','contracts/2MKbxmsxG1BgwYn7ecbOqEHfsG2yrEKSCzgMaDvz.jpg','contracts/He6t5gbgoWcLwqMW40qYHmsbJRS7WTeHC2tq3L9x.jpg','Rent Discount','5,000 AED discount applied for first year'),
(12,2,1,1,'2026-08-21','2026-10-01','2027-09-30',NULL,120000.00,NULL,10000.00,NULL,NULL,0.00,0,'commercial','Commercial office fitout permitted.','active',NULL,'2026-08-21 11:53:59','2026-08-21 12:04:35','contracts/abPjyY2ibRhLv0EaXiAXx56zi75r6FhSm5quybkf.jpg',NULL,'4 Cheques',120000.00,'contracts/ALnjpcHk1ENQsyDGR9I5ewSohmx5ZQu0mSXppGoc.jpg','contracts/d1nWiSwvU8dmxCpGT9B0Q7f8DYQU3eG4Qyh9S4WI.jpg','contracts/aTK5hl4azpUJDq5D5k39h9iYguDkikNyjCzufoop.jpg','Free Months','1 Month Free grace period at start'),
(13,3,1,1,'2026-08-21','2026-11-01','2027-10-31',NULL,36000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential','Standard residential leasing agreement.','active',NULL,'2026-08-21 11:53:59','2026-08-21 12:04:35','contracts/GzDVFFKSCSEq3gziXqiaganR4XTyqCdkCvW2ypaz.jpg',NULL,'12 Cheques',36000.00,'contracts/XGth7JGcatFTNWgRoYE8iA5CxfSxd3yS8mt4D6UT.jpg','contracts/erfvDAU1zKWp4up7dEZIJdYXCMD5NG7gsO2BwvQz.jpg','contracts/4IsRE8jB1ICpCK7EOTadhdk1PsfqPrrKJsrzK5dt.jpg','No Discount',NULL),
(14,7,1,1,'2026-08-21','2026-08-21','2027-08-21',NULL,40000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(15,7,1,1,'2026-08-21','2026-08-21','2027-08-21',NULL,40000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 12:22:07','2026-08-21 12:22:07',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(16,7,1,1,'2026-08-21','2026-08-21','2027-08-21',NULL,40000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 12:27:58','2026-08-21 12:27:58',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(17,7,1,1,'2026-08-21','2026-08-21','2027-08-21',NULL,40000.00,NULL,2000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 12:28:55','2026-08-21 12:28:55',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(18,20,1,1,'2026-08-22','2026-09-01','2027-08-31','2026-09-01',95000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31','contracts/sample_id_front.jpg',NULL,'4 Cheques',95000.00,'contracts/sample_passport.jpg','contracts/sample_visa.jpg','contracts/sample_id_back.jpg','Period Rent Discount','5,000 AED Annual Discount'),
(19,21,1,1,NULL,'2025-01-01','2026-01-01',NULL,50000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(20,22,1,1,'2026-08-22','2026-09-01','2027-08-31','2026-09-01',95000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28','contracts/sample_id_front.jpg',NULL,'4 Cheques',95000.00,'contracts/sample_passport.jpg','contracts/sample_visa.jpg','contracts/sample_id_back.jpg','Period Rent Discount','5,000 AED Annual Discount'),
(21,23,1,1,NULL,'2025-01-01','2026-01-01',NULL,50000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(22,24,1,1,'2026-08-22','2026-09-01','2027-08-31','2026-09-01',95000.00,NULL,5000.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-08-21 22:59:26','2026-08-21 22:59:26','contracts/sample_id_front.jpg',NULL,'4 Cheques',95000.00,'contracts/sample_passport.jpg','contracts/sample_visa.jpg','contracts/sample_id_back.jpg','Period Rent Discount','5,000 AED Annual Discount'),
(23,25,1,1,NULL,'2025-01-01','2026-01-01',NULL,50000.00,NULL,3000.00,NULL,NULL,0.00,0,'residential',NULL,'vacated',NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27',NULL,NULL,'Cash',NULL,NULL,NULL,NULL,NULL,NULL),
(24,5,1,1,NULL,'2026-08-22','2026-09-22',NULL,20000.00,NULL,100.00,NULL,NULL,0.00,0,'commercial',NULL,'active',NULL,'2026-08-21 23:30:19','2026-08-21 23:30:19',NULL,NULL,'cash',1000.00,NULL,NULL,NULL,'Period Rent Discount',NULL),
(25,26,1,6,NULL,'2026-08-25','2026-09-25',NULL,4000.00,NULL,1000.00,NULL,NULL,0.00,0,'residential',NULL,'active',NULL,'2026-08-25 08:10:26','2026-08-25 08:10:26',NULL,NULL,'cash',6.00,NULL,NULL,NULL,NULL,'i month free');
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expenses_category_id_foreign` (`category_id`),
  CONSTRAINT `expenses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES
(1,2,300.00,'2026-08-10','Supplies','2026-08-10 04:22:38','2026-08-10 04:22:38');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `financial_entries`
--

DROP TABLE IF EXISTS `financial_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `financial_entries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('income','expense','loan') NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `entry_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `contract_id` bigint(20) unsigned DEFAULT NULL,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `recorded_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `financial_entries_contract_id_foreign` (`contract_id`),
  KEY `financial_entries_unit_id_foreign` (`unit_id`),
  KEY `financial_entries_recorded_by_foreign` (`recorded_by`),
  CONSTRAINT `financial_entries_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `financial_entries_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `financial_entries_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `financial_entries`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `financial_entries` WRITE;
/*!40000 ALTER TABLE `financial_entries` DISABLE KEYS */;
INSERT INTO `financial_entries` VALUES
(1,'income','Rental Income',23750.00,'2026-08-22','Q3 Rent received for Unit 1402',NULL,NULL,1,'2026-08-21 22:59:27','2026-08-21 22:59:27');
/*!40000 ALTER TABLE `financial_entries` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `incomes`
--

DROP TABLE IF EXISTS `incomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `incomes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `incomes_category_id_foreign` (`category_id`),
  CONSTRAINT `incomes_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incomes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `incomes` WRITE;
/*!40000 ALTER TABLE `incomes` DISABLE KEYS */;
INSERT INTO `incomes` VALUES
(1,1,1000.00,'2026-08-10','Misc income','2026-08-10 04:22:38','2026-08-10 04:22:38');
/*!40000 ALTER TABLE `incomes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `location_type` enum('warehouse','unit') NOT NULL,
  `location_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `unit_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `category` varchar(255) DEFAULT NULL,
  `min_stock_alert` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_items_unit_id_foreign` (`unit_id`),
  CONSTRAINT `inventory_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
INSERT INTO `inventory_items` VALUES
(1,'warehouse',0,'AC Filter',12,45.00,'2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,45.00,'HVAC',5),
(2,'warehouse',0,'Door Lock Set',3,120.00,'2026-08-10 04:22:38','2026-08-10 04:22:38',NULL,120.00,'Hardware',5),
(3,'unit',1,'Water Heater',1,850.00,'2026-08-10 04:22:38','2026-08-10 04:22:38',1,850.00,'Appliance',NULL);
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `item_store`
--

DROP TABLE IF EXISTS `item_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_store` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 0,
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_store_item_id_foreign` (`item_id`),
  CONSTRAINT `item_store_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_store`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `item_store` WRITE;
/*!40000 ALTER TABLE `item_store` DISABLE KEYS */;
INSERT INTO `item_store` VALUES
(1,1,5,'Warehouse','2026-08-10 04:22:38','2026-08-10 04:22:38');
/*!40000 ALTER TABLE `item_store` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES
(1,'Split AC','appliance','LG',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `complaint_id` bigint(20) unsigned NOT NULL,
  `team_id` bigint(20) unsigned DEFAULT NULL,
  `assigned_to` bigint(20) unsigned NOT NULL,
  `assigned_by` bigint(20) unsigned DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'assigned',
  `scheduled_date` date DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenance_jobs_complaint_id_foreign` (`complaint_id`),
  KEY `maintenance_jobs_assigned_to_foreign` (`assigned_to`),
  KEY `jobs_team_id_foreign` (`team_id`),
  KEY `jobs_assigned_by_foreign` (`assigned_by`),
  CONSTRAINT `jobs_assigned_by_foreign` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `jobs_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `maintenance_jobs_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_jobs_complaint_id_foreign` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES
(1,1,NULL,2,1,'completed','2026-08-10','2026-08-11 13:09:07','etc','2026-08-10 04:22:38','2026-08-11 08:09:07'),
(2,2,NULL,2,2,'completed',NULL,'2026-08-16 19:59:29',NULL,'2026-08-11 08:12:25','2026-08-16 14:59:29'),
(3,4,NULL,2,2,'completed',NULL,'2026-08-16 19:59:32',NULL,'2026-08-16 14:59:06','2026-08-16 14:59:32'),
(4,3,NULL,2,2,'completed',NULL,'2026-08-16 19:59:34',NULL,'2026-08-16 14:59:12','2026-08-16 14:59:34'),
(5,5,1,2,1,'in_progress','2026-08-18',NULL,'Dispatched technician for inspection','2026-08-17 07:57:44','2026-08-17 07:57:44'),
(6,6,NULL,2,1,'in_progress','2026-08-18',NULL,NULL,'2026-08-17 07:57:44','2026-08-20 11:48:43'),
(7,7,1,2,1,'completed','2026-08-18','2026-08-20 16:49:24','Dispatched technician for inspection','2026-08-17 07:57:44','2026-08-20 11:49:24'),
(8,8,1,2,1,'completed','2026-08-18','2026-08-20 16:49:19','Dispatched technician for inspection','2026-08-17 07:57:44','2026-08-20 11:49:19'),
(9,17,NULL,2,2,'in_progress',NULL,NULL,NULL,'2026-08-21 23:12:49','2026-08-21 23:12:49'),
(10,17,NULL,2,2,'completed',NULL,'2026-08-22 04:12:49',NULL,'2026-08-21 23:12:49','2026-08-21 23:12:49'),
(11,18,NULL,2,2,'in_progress',NULL,NULL,NULL,'2026-08-21 23:13:23','2026-08-21 23:13:23'),
(12,18,NULL,2,2,'completed',NULL,'2026-08-22 04:13:23',NULL,'2026-08-21 23:13:23','2026-08-21 23:13:23');
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `legal_case_documents`
--

DROP TABLE IF EXISTS `legal_case_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_case_documents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `legal_case_id` bigint(20) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `legal_case_documents_legal_case_id_foreign` (`legal_case_id`),
  CONSTRAINT `legal_case_documents_legal_case_id_foreign` FOREIGN KEY (`legal_case_id`) REFERENCES `legal_cases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_case_documents`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `legal_case_documents` WRITE;
/*!40000 ALTER TABLE `legal_case_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `legal_case_documents` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `legal_cases`
--

DROP TABLE IF EXISTS `legal_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `legal_cases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned DEFAULT NULL,
  `settlement_id` bigint(20) unsigned DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `legal_cases_contract_id_foreign` (`contract_id`),
  KEY `legal_cases_settlement_id_foreign` (`settlement_id`),
  KEY `legal_cases_status_index` (`status`),
  CONSTRAINT `legal_cases_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `legal_cases_settlement_id_foreign` FOREIGN KEY (`settlement_id`) REFERENCES `settlements` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `legal_cases`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `legal_cases` WRITE;
/*!40000 ALTER TABLE `legal_cases` DISABLE KEYS */;
INSERT INTO `legal_cases` VALUES
(1,20,NULL,'active','Dubai Rental Dispute Center case filed for non-payment','2026-08-21 22:55:28','2026-08-21 22:55:28'),
(2,22,NULL,'active','Dubai Rental Dispute Center case filed for non-payment','2026-08-21 22:59:27','2026-08-21 22:59:27');
/*!40000 ALTER TABLE `legal_cases` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `maintenance_charges`
--

DROP TABLE IF EXISTS `maintenance_charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_charges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint(20) unsigned DEFAULT NULL,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenance_charges_job_id_foreign` (`job_id`),
  KEY `maintenance_charges_unit_id_foreign` (`unit_id`),
  CONSTRAINT `maintenance_charges_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `maintenance_charges_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_charges`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `maintenance_charges` WRITE;
/*!40000 ALTER TABLE `maintenance_charges` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_charges` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `maintenances`
--

DROP TABLE IF EXISTS `maintenances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenances_unit_id_foreign` (`unit_id`),
  CONSTRAINT `maintenances_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `maintenances` WRITE;
/*!40000 ALTER TABLE `maintenances` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenances` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2026_07_27_093512_create_buildings_table',1),
(5,'2026_07_27_093513_create_units_table',1),
(6,'2026_07_27_093515_create_tenants_table',1),
(7,'2026_07_27_093516_create_contracts_table',1),
(8,'2026_07_27_093517_create_payments_table',1),
(9,'2026_07_27_093518_create_rent_ledger_table',1),
(10,'2026_07_27_093519_create_pdc_cheques_table',1),
(11,'2026_07_27_093520_create_complaints_table',1),
(12,'2026_07_27_093521_create_maintenance_jobs_table',1),
(13,'2026_07_27_093522_create_appliances_table',1),
(14,'2026_07_27_093524_create_inventory_items_table',1),
(15,'2026_07_27_093525_create_purchase_orders_table',1),
(16,'2026_07_27_093526_create_legal_cases_table',1),
(17,'2026_07_27_093527_create_contract_call_logs_table',1),
(18,'2026_07_27_093528_create_notifications_log_table',1),
(19,'2026_07_27_095803_create_personal_access_tokens_table',1),
(20,'2026_07_29_050655_create_service_charges_table',1),
(21,'2026_07_29_050657_create_settlements_table',1),
(22,'2026_07_29_050700_create_financial_entries_table',1),
(23,'2026_07_29_050701_create_payment_audit_logs_table',1),
(24,'2026_07_29_050702_create_notification_settings_table',1),
(25,'2026_07_29_050703_alter_tables_to_align_with_models',1),
(26,'2026_07_29_190000_rename_tables_to_real_schema',1),
(27,'2026_07_29_200000_create_missing_real_schema_tables',1),
(28,'2026_07_29_210000_align_columns_with_real_schema',1),
(29,'2026_07_29_220000_drop_legal_cases_table',1),
(30,'2026_07_29_230000_rebuild_rent_transactions_debit_credit',1),
(31,'2026_08_01_040000_add_last_renewed_at_to_contracts_table',1),
(32,'2026_08_01_050000_payments_ledger_soft_delete_and_links',1),
(33,'2026_08_01_060000_add_contract_id_to_settlements_table',1),
(34,'2026_08_05_190000_create_booking_cash_receipts_table',1),
(35,'2026_08_05_190100_create_legal_cases_tables',1),
(36,'2026_08_06_065430_add_extra_fields_to_contracts_table',1),
(37,'2026_08_08_140000_fix_owner_id_foreign_keys_to_owners_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notification_settings`
--

DROP TABLE IF EXISTS `notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `recipient_email` varchar(255) DEFAULT NULL,
  `days_before_expiry` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notification_settings` WRITE;
/*!40000 ALTER TABLE `notification_settings` DISABLE KEYS */;
INSERT INTO `notification_settings` VALUES
(1,'contract_expiry',1,'admin@gofreehold.ae',100,'Contract Expiry Alerts (~100 days before expiry)','2026-08-11 08:09:46','2026-08-11 08:09:46'),
(2,'pending_cheques',0,'finance@gofreehold.ae',7,'Pending Cheque Alerts','2026-08-11 08:09:46','2026-08-21 11:25:42'),
(3,'vacant_properties',1,'admin@gofreehold.ae',0,'Vacant Property Weekly Alerts','2026-08-11 08:09:46','2026-08-11 08:09:46'),
(4,'monthly_dues',1,'billing@gofreehold.ae',0,'Monthly Rent Due Posting Alerts','2026-08-11 08:09:46','2026-08-11 08:09:46');
/*!40000 ALTER TABLE `notification_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notifications_log`
--

DROP TABLE IF EXISTS `notifications_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `recipient_id` bigint(20) unsigned NOT NULL,
  `message` text NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'sent',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_log_recipient_id_foreign` (`recipient_id`),
  CONSTRAINT `notifications_log_recipient_id_foreign` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_log`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notifications_log` WRITE;
/*!40000 ALTER TABLE `notifications_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications_log` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `owners`
--

DROP TABLE IF EXISTS `owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `owners` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owners_user_id_foreign` (`user_id`),
  CONSTRAINT `owners_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owners`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `owners` WRITE;
/*!40000 ALTER TABLE `owners` DISABLE KEYS */;
INSERT INTO `owners` VALUES
(1,3,'Owner One Profile','0501111111','owner1@gofreehold.com',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,4,'Owner Two Profile','0502222222','owner2@gofreehold.com',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(3,8,'Owner User',NULL,'owner@gofreehold.com',NULL,'2026-08-16 14:34:28','2026-08-16 14:34:28'),
(4,10,'Mohammed Al Rashidi','+971501234001','m.rashidi@gfh.com','Downtown Dubai','2026-08-17 07:54:11','2026-08-17 07:54:11'),
(5,11,'Khalid Ibrahim Saeed','+971501234002','k.saeed@gfh.com','Business Bay, Dubai','2026-08-17 07:54:13','2026-08-17 07:54:13'),
(6,12,'Priya Nair Menon','+971501234003','p.menon@gfh.com','Dubai Marina','2026-08-17 07:54:14','2026-08-17 07:54:14'),
(7,13,'David James Carter','+971501234004','d.carter@gfh.com','Palm Jumeirah','2026-08-17 07:54:15','2026-08-17 07:54:15'),
(8,NULL,'Secondary Investor Profile',NULL,'second.owner@gofreehold.ae',NULL,'2026-08-21 23:04:47','2026-08-21 23:04:47');
/*!40000 ALTER TABLE `owners` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `payment_audit_logs`
--

DROP TABLE IF EXISTS `payment_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ledger_id` bigint(20) unsigned DEFAULT NULL,
  `payment_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `reason` text NOT NULL,
  `performed_by` bigint(20) unsigned DEFAULT NULL,
  `snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`snapshot`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_audit_logs_performed_by_foreign` (`performed_by`),
  KEY `payment_audit_logs_ledger_id_foreign` (`ledger_id`),
  CONSTRAINT `payment_audit_logs_ledger_id_foreign` FOREIGN KEY (`ledger_id`) REFERENCES `rent_transactions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payment_audit_logs_performed_by_foreign` FOREIGN KEY (`performed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_audit_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `payment_audit_logs` WRITE;
/*!40000 ALTER TABLE `payment_audit_logs` DISABLE KEYS */;
INSERT INTO `payment_audit_logs` VALUES
(1,NULL,246,'deleted','Client duplicated transaction entry error',1,'{\"id\":246,\"contract_id\":2,\"tenant_id\":2,\"type\":\"other\",\"mode\":\"cash\",\"amount\":\"300.00\",\"date\":\"2026-08-18T00:00:00.000000Z\",\"due_date\":null,\"receipt_number\":null,\"reference_number\":null,\"remarks\":\"Temporary duplicate payment to be deleted\",\"recorded_by\":null,\"deleted_by\":null,\"deletion_reason\":null,\"created_at\":\"2026-08-18T07:56:41.000000Z\",\"updated_at\":\"2026-08-18T07:56:41.000000Z\",\"deleted_at\":null,\"entity\":\"payment\",\"linked_ledger_ids\":[]}','2026-08-18 02:56:41','2026-08-18 02:56:41');
/*!40000 ALTER TABLE `payment_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `tenant_id` bigint(20) unsigned DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `mode` varchar(255) NOT NULL DEFAULT 'cash',
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `receipt_number` varchar(255) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `recorded_by` bigint(20) unsigned DEFAULT NULL,
  `deleted_by` bigint(20) unsigned DEFAULT NULL,
  `deletion_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_contract_id_foreign` (`contract_id`),
  KEY `payments_tenant_id_foreign` (`tenant_id`),
  KEY `payments_recorded_by_foreign` (`recorded_by`),
  CONSTRAINT `payments_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=254 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES
(1,1,1,'rent','bank_transfer',20000.00,'2026-08-10',NULL,NULL,NULL,'Seed payment',1,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38',NULL),
(2,2,2,'rent','cash',6666.67,'2026-08-17',NULL,NULL,NULL,'[AUTO-TEST] Monthly Rent Aug',NULL,NULL,NULL,'2026-08-17 03:02:21','2026-08-17 03:02:21',NULL),
(3,2,2,'dewa','bank_transfer',450.00,'2026-08-17',NULL,NULL,NULL,'[AUTO-TEST] DEWA Aug',NULL,NULL,NULL,'2026-08-17 03:02:21','2026-08-17 03:02:21',NULL),
(4,1,1,'deposit','cheque',4166.67,'2026-02-10',NULL,NULL,NULL,'Security Deposit received',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(5,1,1,'rent','bank_transfer',4166.67,'2026-02-10',NULL,NULL,NULL,'Month 1 Rent',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(6,1,1,'rent','bank_transfer',4166.67,'2026-03-10',NULL,NULL,NULL,'Month 2 Rent',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(7,1,1,'dewa','cash',380.00,'2026-02-10',NULL,NULL,NULL,'DEWA - Month 1',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(8,1,1,'dewa','cash',420.50,'2026-03-10',NULL,NULL,NULL,'DEWA - Month 2',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(9,2,2,'deposit','cheque',6666.67,'2025-09-10',NULL,NULL,NULL,'Security Deposit',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(10,2,2,'rent','bank_transfer',6666.67,'2025-09-10',NULL,NULL,NULL,'Monthly Rent - Sep 2025',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(11,2,2,'rent','cheque',6666.67,'2025-10-10',NULL,NULL,NULL,'Monthly Rent - Oct 2025',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(12,2,2,'rent','bank_transfer',6666.67,'2025-11-10',NULL,NULL,NULL,'Monthly Rent - Nov 2025',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(13,2,2,'rent','cheque',6666.67,'2025-12-10',NULL,NULL,NULL,'Monthly Rent - Dec 2025',NULL,NULL,NULL,'2026-08-17 03:12:23','2026-08-17 03:12:23',NULL),
(14,2,2,'rent','bank_transfer',6666.67,'2026-01-10',NULL,NULL,NULL,'Monthly Rent - Jan 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(15,2,2,'rent','cheque',6666.67,'2026-02-10',NULL,NULL,NULL,'Monthly Rent - Feb 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(16,2,2,'rent','bank_transfer',6666.67,'2026-03-10',NULL,NULL,NULL,'Monthly Rent - Mar 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(17,2,2,'rent','cheque',6666.67,'2026-04-10',NULL,NULL,NULL,'Monthly Rent - Apr 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(18,2,2,'rent','bank_transfer',6666.67,'2026-05-10',NULL,NULL,NULL,'Monthly Rent - May 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(19,2,2,'rent','cheque',6666.67,'2026-06-10',NULL,NULL,NULL,'Monthly Rent - Jun 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(20,2,2,'rent','bank_transfer',6666.67,'2026-07-10',NULL,NULL,NULL,'Monthly Rent - Jul 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(21,2,2,'rent','cheque',6666.67,'2026-08-10',NULL,NULL,NULL,'Monthly Rent - Aug 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(22,2,2,'dewa','cash',392.46,'2025-09-10',NULL,NULL,NULL,'DEWA Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(23,2,2,'dewa','cash',520.24,'2025-10-10',NULL,NULL,NULL,'DEWA Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(24,2,2,'dewa','cash',616.51,'2025-11-10',NULL,NULL,NULL,'DEWA Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(25,2,2,'dewa','cash',402.22,'2025-12-10',NULL,NULL,NULL,'DEWA Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(26,2,2,'dewa','cash',378.24,'2026-01-10',NULL,NULL,NULL,'DEWA Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(27,2,2,'dewa','cash',615.92,'2026-02-10',NULL,NULL,NULL,'DEWA Bill - Feb 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(28,2,2,'service_charge','bank_transfer',333.33,'2025-09-10',NULL,NULL,NULL,'Annual Service Charge (5%)',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(29,3,3,'deposit','cheque',10000.00,'2025-08-10',NULL,NULL,NULL,'Security Deposit received',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(30,3,3,'rent','bank_transfer',10000.00,'2025-08-10',NULL,NULL,NULL,'Month 1 Rent',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(31,3,3,'rent','bank_transfer',10000.00,'2025-09-10',NULL,NULL,NULL,'Month 2 Rent',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(32,3,3,'dewa','cash',380.00,'2025-08-10',NULL,NULL,NULL,'DEWA - Month 1',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(33,3,3,'dewa','cash',420.50,'2025-09-10',NULL,NULL,NULL,'DEWA - Month 2',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(34,4,2,'deposit','cheque',10833.33,'2025-03-15',NULL,NULL,NULL,'Security Deposit',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(35,4,2,'rent','bank_transfer',10833.33,'2025-03-15',NULL,NULL,NULL,'Monthly Rent - Mar 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(36,4,2,'rent','cheque',10833.33,'2025-04-15',NULL,NULL,NULL,'Monthly Rent - Apr 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(37,4,2,'rent','bank_transfer',10833.33,'2025-05-15',NULL,NULL,NULL,'Monthly Rent - May 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(38,4,2,'rent','cheque',10833.33,'2025-06-15',NULL,NULL,NULL,'Monthly Rent - Jun 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(39,4,2,'rent','bank_transfer',10833.33,'2025-07-15',NULL,NULL,NULL,'Monthly Rent - Jul 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(40,4,2,'rent','cheque',10833.33,'2025-08-15',NULL,NULL,NULL,'Monthly Rent - Aug 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(41,4,2,'rent','bank_transfer',10833.33,'2025-09-15',NULL,NULL,NULL,'Monthly Rent - Sep 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(42,4,2,'rent','cheque',10833.33,'2025-10-15',NULL,NULL,NULL,'Monthly Rent - Oct 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(43,4,2,'rent','bank_transfer',10833.33,'2025-11-15',NULL,NULL,NULL,'Monthly Rent - Nov 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(44,4,2,'rent','cheque',10833.33,'2025-12-15',NULL,NULL,NULL,'Monthly Rent - Dec 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(45,4,2,'rent','bank_transfer',10833.33,'2026-01-15',NULL,NULL,NULL,'Monthly Rent - Jan 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(46,4,2,'rent','cheque',10833.33,'2026-02-15',NULL,NULL,NULL,'Monthly Rent - Feb 2026',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(47,4,2,'dewa','cash',623.42,'2025-03-15',NULL,NULL,NULL,'DEWA Bill - Mar 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(48,4,2,'dewa','cash',503.65,'2025-04-15',NULL,NULL,NULL,'DEWA Bill - Apr 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(49,4,2,'dewa','cash',545.46,'2025-05-15',NULL,NULL,NULL,'DEWA Bill - May 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(50,4,2,'dewa','cash',356.20,'2025-06-15',NULL,NULL,NULL,'DEWA Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(51,4,2,'dewa','cash',422.89,'2025-07-15',NULL,NULL,NULL,'DEWA Bill - Jul 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(52,4,2,'dewa','cash',567.67,'2025-08-15',NULL,NULL,NULL,'DEWA Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(53,4,2,'service_charge','bank_transfer',541.67,'2025-03-15',NULL,NULL,NULL,'Annual Service Charge (5%)',NULL,NULL,NULL,'2026-08-17 03:12:24','2026-08-17 03:12:24',NULL),
(54,1,1,'rent','cash',4166.67,'2026-02-10',NULL,NULL,NULL,'Rent installment - Month 1 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL),
(55,1,1,'rent','bank_transfer',4166.67,'2026-03-10',NULL,NULL,NULL,'Rent installment - Month 2 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL),
(56,1,1,'rent','cash',4166.67,'2026-04-10',NULL,NULL,NULL,'Rent installment - Month 3 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:43','2026-08-17 07:57:43',NULL),
(57,1,1,'rent','bank_transfer',4166.67,'2026-05-10',NULL,NULL,NULL,'Rent installment - Month 4 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(58,1,1,'rent','cash',4166.67,'2026-06-10',NULL,NULL,NULL,'Rent installment - Month 5 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(59,1,1,'rent','bank_transfer',4166.67,'2026-07-10',NULL,NULL,NULL,'Rent installment - Month 6 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(60,1,1,'rent','cash',4166.67,'2026-08-10',NULL,NULL,NULL,'Rent installment - Month 7 (Aug 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(61,1,1,'rent','bank_transfer',4166.67,'2026-09-10',NULL,NULL,NULL,'Rent installment - Month 8 (Sep 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(62,1,1,'rent','cash',4166.67,'2026-10-10',NULL,NULL,NULL,'Rent installment - Month 9 (Oct 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(63,1,1,'rent','bank_transfer',4166.67,'2026-11-10',NULL,NULL,NULL,'Rent installment - Month 10 (Nov 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(64,1,1,'rent','cash',4166.67,'2026-12-10',NULL,NULL,NULL,'Rent installment - Month 11 (Dec 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(65,1,1,'rent','bank_transfer',4166.67,'2027-01-10',NULL,NULL,NULL,'Rent installment - Month 12 (Jan 2027)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(66,1,1,'dewa','bank_transfer',451.76,'2026-02-10',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(67,1,1,'dewa','bank_transfer',548.32,'2026-03-10',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(68,1,1,'dewa','bank_transfer',437.38,'2026-04-10',NULL,NULL,NULL,'DEWA Utility Bill - Apr 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(69,1,1,'dewa','bank_transfer',398.39,'2026-05-10',NULL,NULL,NULL,'DEWA Utility Bill - May 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(70,1,1,'dewa','bank_transfer',590.80,'2026-06-10',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(71,1,1,'dewa','bank_transfer',447.71,'2026-07-10',NULL,NULL,NULL,'DEWA Utility Bill - Jul 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(72,2,2,'rent','cash',6666.67,'2025-09-10',NULL,NULL,NULL,'Rent installment - Month 1 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(73,2,2,'rent','bank_transfer',6666.67,'2025-10-10',NULL,NULL,NULL,'Rent installment - Month 2 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(74,2,2,'rent','cash',6666.67,'2025-11-10',NULL,NULL,NULL,'Rent installment - Month 3 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(75,2,2,'rent','bank_transfer',6666.67,'2025-12-10',NULL,NULL,NULL,'Rent installment - Month 4 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(76,2,2,'rent','cash',6666.67,'2026-01-10',NULL,NULL,NULL,'Rent installment - Month 5 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(77,2,2,'rent','bank_transfer',6666.67,'2026-02-10',NULL,NULL,NULL,'Rent installment - Month 6 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(78,2,2,'rent','cash',6666.67,'2026-03-10',NULL,NULL,NULL,'Rent installment - Month 7 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(79,2,2,'rent','bank_transfer',6666.67,'2026-04-10',NULL,NULL,NULL,'Rent installment - Month 8 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(80,2,2,'rent','cash',6666.67,'2026-05-10',NULL,NULL,NULL,'Rent installment - Month 9 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(81,2,2,'rent','bank_transfer',6666.67,'2026-06-10',NULL,NULL,NULL,'Rent installment - Month 10 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(82,2,2,'rent','cash',6666.67,'2026-07-10',NULL,NULL,NULL,'Rent installment - Month 11 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(83,2,2,'rent','bank_transfer',6666.67,'2026-08-10',NULL,NULL,NULL,'Rent installment - Month 12 (Aug 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(84,2,2,'dewa','bank_transfer',547.63,'2025-09-10',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(85,2,2,'dewa','bank_transfer',494.66,'2025-10-10',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(86,2,2,'dewa','bank_transfer',416.26,'2025-11-10',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(87,2,2,'dewa','bank_transfer',602.05,'2025-12-10',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(88,2,2,'dewa','bank_transfer',605.21,'2026-01-10',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(89,2,2,'dewa','bank_transfer',588.23,'2026-02-10',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(90,3,3,'rent','cash',10000.00,'2025-08-10',NULL,NULL,NULL,'Rent installment - Month 1 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(91,3,3,'rent','bank_transfer',10000.00,'2025-09-10',NULL,NULL,NULL,'Rent installment - Month 2 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(92,3,3,'rent','cash',10000.00,'2025-10-10',NULL,NULL,NULL,'Rent installment - Month 3 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(93,3,3,'rent','bank_transfer',10000.00,'2025-11-10',NULL,NULL,NULL,'Rent installment - Month 4 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(94,3,3,'rent','cash',10000.00,'2025-12-10',NULL,NULL,NULL,'Rent installment - Month 5 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(95,3,3,'rent','bank_transfer',10000.00,'2026-01-10',NULL,NULL,NULL,'Rent installment - Month 6 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(96,3,3,'rent','cash',10000.00,'2026-02-10',NULL,NULL,NULL,'Rent installment - Month 7 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(97,3,3,'rent','bank_transfer',10000.00,'2026-03-10',NULL,NULL,NULL,'Rent installment - Month 8 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(98,3,3,'rent','cash',10000.00,'2026-04-10',NULL,NULL,NULL,'Rent installment - Month 9 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(99,3,3,'rent','bank_transfer',10000.00,'2026-05-10',NULL,NULL,NULL,'Rent installment - Month 10 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(100,3,3,'rent','cash',10000.00,'2026-06-10',NULL,NULL,NULL,'Rent installment - Month 11 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(101,3,3,'rent','bank_transfer',10000.00,'2026-07-10',NULL,NULL,NULL,'Rent installment - Month 12 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(102,3,3,'dewa','bank_transfer',645.23,'2025-08-10',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(103,3,3,'dewa','bank_transfer',432.70,'2025-09-10',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(104,3,3,'dewa','bank_transfer',617.08,'2025-10-10',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(105,3,3,'dewa','bank_transfer',423.06,'2025-11-10',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(106,3,3,'dewa','bank_transfer',470.58,'2025-12-10',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(107,3,3,'dewa','bank_transfer',631.20,'2026-01-10',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(108,4,2,'rent','cash',10833.33,'2025-03-15',NULL,NULL,NULL,'Rent installment - Month 1 (Mar 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(109,4,2,'rent','bank_transfer',10833.33,'2025-04-15',NULL,NULL,NULL,'Rent installment - Month 2 (Apr 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(110,4,2,'rent','cash',10833.33,'2025-05-15',NULL,NULL,NULL,'Rent installment - Month 3 (May 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(111,4,2,'rent','bank_transfer',10833.33,'2025-06-15',NULL,NULL,NULL,'Rent installment - Month 4 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(112,4,2,'rent','cash',10833.33,'2025-07-15',NULL,NULL,NULL,'Rent installment - Month 5 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(113,4,2,'rent','bank_transfer',10833.33,'2025-08-15',NULL,NULL,NULL,'Rent installment - Month 6 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(114,4,2,'rent','cash',10833.33,'2025-09-15',NULL,NULL,NULL,'Rent installment - Month 7 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(115,4,2,'rent','bank_transfer',10833.33,'2025-10-15',NULL,NULL,NULL,'Rent installment - Month 8 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(116,4,2,'rent','cash',10833.33,'2025-11-15',NULL,NULL,NULL,'Rent installment - Month 9 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(117,4,2,'rent','bank_transfer',10833.33,'2025-12-15',NULL,NULL,NULL,'Rent installment - Month 10 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(118,4,2,'rent','cash',10833.33,'2026-01-15',NULL,NULL,NULL,'Rent installment - Month 11 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(119,4,2,'rent','bank_transfer',10833.33,'2026-02-15',NULL,NULL,NULL,'Rent installment - Month 12 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(120,4,2,'dewa','bank_transfer',403.28,'2025-03-15',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(121,4,2,'dewa','bank_transfer',458.28,'2025-04-15',NULL,NULL,NULL,'DEWA Utility Bill - Apr 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(122,4,2,'dewa','bank_transfer',396.98,'2025-05-15',NULL,NULL,NULL,'DEWA Utility Bill - May 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(123,4,2,'dewa','bank_transfer',574.22,'2025-06-15',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(124,4,2,'dewa','bank_transfer',437.34,'2025-07-15',NULL,NULL,NULL,'DEWA Utility Bill - Jul 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(125,4,2,'dewa','bank_transfer',463.06,'2025-08-15',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(126,5,5,'deposit','cheque',7083.33,'2025-01-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(127,5,5,'rent','cash',7083.33,'2025-01-01',NULL,NULL,NULL,'Rent installment - Month 1 (Jan 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(128,5,5,'rent','bank_transfer',7083.33,'2025-02-01',NULL,NULL,NULL,'Rent installment - Month 2 (Feb 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(129,5,5,'rent','cash',7083.33,'2025-03-01',NULL,NULL,NULL,'Rent installment - Month 3 (Mar 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(130,5,5,'rent','bank_transfer',7083.33,'2025-04-01',NULL,NULL,NULL,'Rent installment - Month 4 (Apr 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(131,5,5,'rent','cash',7083.33,'2025-05-01',NULL,NULL,NULL,'Rent installment - Month 5 (May 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(132,5,5,'rent','bank_transfer',7083.33,'2025-06-01',NULL,NULL,NULL,'Rent installment - Month 6 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(133,5,5,'rent','cash',7083.33,'2025-07-01',NULL,NULL,NULL,'Rent installment - Month 7 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(134,5,5,'rent','bank_transfer',7083.33,'2025-08-01',NULL,NULL,NULL,'Rent installment - Month 8 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(135,5,5,'rent','cash',7083.33,'2025-09-01',NULL,NULL,NULL,'Rent installment - Month 9 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(136,5,5,'rent','bank_transfer',7083.33,'2025-10-01',NULL,NULL,NULL,'Rent installment - Month 10 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(137,5,5,'rent','cash',7083.33,'2025-11-01',NULL,NULL,NULL,'Rent installment - Month 11 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(138,5,5,'rent','bank_transfer',7083.33,'2025-12-01',NULL,NULL,NULL,'Rent installment - Month 12 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(139,5,5,'dewa','bank_transfer',539.05,'2025-01-01',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(140,5,5,'dewa','bank_transfer',592.43,'2025-02-01',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(141,5,5,'dewa','bank_transfer',432.53,'2025-03-01',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(142,5,5,'dewa','bank_transfer',482.79,'2025-04-01',NULL,NULL,NULL,'DEWA Utility Bill - Apr 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(143,5,5,'dewa','bank_transfer',384.36,'2025-05-01',NULL,NULL,NULL,'DEWA Utility Bill - May 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(144,5,5,'dewa','bank_transfer',597.80,'2025-06-01',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(145,6,6,'deposit','cheque',10833.33,'2025-03-15',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(146,6,6,'rent','cash',10833.33,'2025-03-15',NULL,NULL,NULL,'Rent installment - Month 1 (Mar 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(147,6,6,'rent','bank_transfer',10833.33,'2025-04-15',NULL,NULL,NULL,'Rent installment - Month 2 (Apr 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(148,6,6,'rent','cash',10833.33,'2025-05-15',NULL,NULL,NULL,'Rent installment - Month 3 (May 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(149,6,6,'rent','bank_transfer',10833.33,'2025-06-15',NULL,NULL,NULL,'Rent installment - Month 4 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(150,6,6,'rent','cash',10833.33,'2025-07-15',NULL,NULL,NULL,'Rent installment - Month 5 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(151,6,6,'rent','bank_transfer',10833.33,'2025-08-15',NULL,NULL,NULL,'Rent installment - Month 6 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(152,6,6,'rent','cash',10833.33,'2025-09-15',NULL,NULL,NULL,'Rent installment - Month 7 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(153,6,6,'rent','bank_transfer',10833.33,'2025-10-15',NULL,NULL,NULL,'Rent installment - Month 8 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(154,6,6,'rent','cash',10833.33,'2025-11-15',NULL,NULL,NULL,'Rent installment - Month 9 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(155,6,6,'rent','bank_transfer',10833.33,'2025-12-15',NULL,NULL,NULL,'Rent installment - Month 10 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(156,6,6,'rent','cash',10833.33,'2026-01-15',NULL,NULL,NULL,'Rent installment - Month 11 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(157,6,6,'rent','bank_transfer',10833.33,'2026-02-15',NULL,NULL,NULL,'Rent installment - Month 12 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(158,6,6,'dewa','bank_transfer',471.95,'2025-03-15',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(159,6,6,'dewa','bank_transfer',381.10,'2025-04-15',NULL,NULL,NULL,'DEWA Utility Bill - Apr 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(160,6,6,'dewa','bank_transfer',600.70,'2025-05-15',NULL,NULL,NULL,'DEWA Utility Bill - May 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(161,6,6,'dewa','bank_transfer',503.78,'2025-06-15',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(162,6,6,'dewa','bank_transfer',410.84,'2025-07-15',NULL,NULL,NULL,'DEWA Utility Bill - Jul 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(163,6,6,'dewa','bank_transfer',420.21,'2025-08-15',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(164,7,7,'deposit','cheque',18333.33,'2025-06-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(165,7,7,'rent','cash',18333.33,'2025-06-01',NULL,NULL,NULL,'Rent installment - Month 1 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(166,7,7,'rent','bank_transfer',18333.33,'2025-07-01',NULL,NULL,NULL,'Rent installment - Month 2 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(167,7,7,'rent','cash',18333.33,'2025-08-01',NULL,NULL,NULL,'Rent installment - Month 3 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(168,7,7,'rent','bank_transfer',18333.33,'2025-09-01',NULL,NULL,NULL,'Rent installment - Month 4 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(169,7,7,'rent','cash',18333.33,'2025-10-01',NULL,NULL,NULL,'Rent installment - Month 5 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(170,7,7,'rent','bank_transfer',18333.33,'2025-11-01',NULL,NULL,NULL,'Rent installment - Month 6 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(171,7,7,'rent','cash',18333.33,'2025-12-01',NULL,NULL,NULL,'Rent installment - Month 7 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(172,7,7,'rent','bank_transfer',18333.33,'2026-01-01',NULL,NULL,NULL,'Rent installment - Month 8 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(173,7,7,'rent','cash',18333.33,'2026-02-01',NULL,NULL,NULL,'Rent installment - Month 9 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(174,7,7,'rent','bank_transfer',18333.33,'2026-03-01',NULL,NULL,NULL,'Rent installment - Month 10 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(175,7,7,'rent','cash',18333.33,'2026-04-01',NULL,NULL,NULL,'Rent installment - Month 11 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(176,7,7,'rent','bank_transfer',18333.33,'2026-05-01',NULL,NULL,NULL,'Rent installment - Month 12 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(177,7,7,'dewa','bank_transfer',634.70,'2025-06-01',NULL,NULL,NULL,'DEWA Utility Bill - Jun 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(178,7,7,'dewa','bank_transfer',397.86,'2025-07-01',NULL,NULL,NULL,'DEWA Utility Bill - Jul 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(179,7,7,'dewa','bank_transfer',639.87,'2025-08-01',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(180,7,7,'dewa','bank_transfer',492.56,'2025-09-01',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(181,7,7,'dewa','bank_transfer',648.81,'2025-10-01',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(182,7,7,'dewa','bank_transfer',539.44,'2025-11-01',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(183,8,8,'deposit','cheque',7916.67,'2024-09-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(184,8,8,'rent','cash',7916.67,'2024-09-01',NULL,NULL,NULL,'Rent installment - Month 1 (Sep 2024)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(185,8,8,'rent','bank_transfer',7916.67,'2024-10-01',NULL,NULL,NULL,'Rent installment - Month 2 (Oct 2024)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(186,8,8,'rent','cash',7916.67,'2024-11-01',NULL,NULL,NULL,'Rent installment - Month 3 (Nov 2024)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(187,8,8,'rent','bank_transfer',7916.67,'2024-12-01',NULL,NULL,NULL,'Rent installment - Month 4 (Dec 2024)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(188,8,8,'rent','cash',7916.67,'2025-01-01',NULL,NULL,NULL,'Rent installment - Month 5 (Jan 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(189,8,8,'rent','bank_transfer',7916.67,'2025-02-01',NULL,NULL,NULL,'Rent installment - Month 6 (Feb 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(190,8,8,'rent','cash',7916.67,'2025-03-01',NULL,NULL,NULL,'Rent installment - Month 7 (Mar 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(191,8,8,'rent','bank_transfer',7916.67,'2025-04-01',NULL,NULL,NULL,'Rent installment - Month 8 (Apr 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(192,8,8,'rent','cash',7916.67,'2025-05-01',NULL,NULL,NULL,'Rent installment - Month 9 (May 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(193,8,8,'rent','bank_transfer',7916.67,'2025-06-01',NULL,NULL,NULL,'Rent installment - Month 10 (Jun 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(194,8,8,'rent','cash',7916.67,'2025-07-01',NULL,NULL,NULL,'Rent installment - Month 11 (Jul 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(195,8,8,'rent','bank_transfer',7916.67,'2025-08-01',NULL,NULL,NULL,'Rent installment - Month 12 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(196,8,8,'dewa','bank_transfer',575.00,'2024-09-01',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2024',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(197,8,8,'dewa','bank_transfer',421.40,'2024-10-01',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2024',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(198,8,8,'dewa','bank_transfer',496.63,'2024-11-01',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2024',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(199,8,8,'dewa','bank_transfer',413.25,'2024-12-01',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2024',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(200,8,8,'dewa','bank_transfer',559.72,'2025-01-01',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(201,8,8,'dewa','bank_transfer',618.92,'2025-02-01',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(202,9,9,'deposit','cheque',11666.67,'2025-08-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(203,9,9,'rent','cash',11666.67,'2025-08-01',NULL,NULL,NULL,'Rent installment - Month 1 (Aug 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(204,9,9,'rent','bank_transfer',11666.67,'2025-09-01',NULL,NULL,NULL,'Rent installment - Month 2 (Sep 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(205,9,9,'rent','cash',11666.67,'2025-10-01',NULL,NULL,NULL,'Rent installment - Month 3 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(206,9,9,'rent','bank_transfer',11666.67,'2025-11-01',NULL,NULL,NULL,'Rent installment - Month 4 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(207,9,9,'rent','cash',11666.67,'2025-12-01',NULL,NULL,NULL,'Rent installment - Month 5 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(208,9,9,'rent','bank_transfer',11666.67,'2026-01-01',NULL,NULL,NULL,'Rent installment - Month 6 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(209,9,9,'rent','cash',11666.67,'2026-02-01',NULL,NULL,NULL,'Rent installment - Month 7 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(210,9,9,'rent','bank_transfer',11666.67,'2026-03-01',NULL,NULL,NULL,'Rent installment - Month 8 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(211,9,9,'rent','cash',11666.67,'2026-04-01',NULL,NULL,NULL,'Rent installment - Month 9 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(212,9,9,'rent','bank_transfer',11666.67,'2026-05-01',NULL,NULL,NULL,'Rent installment - Month 10 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(213,9,9,'rent','cash',11666.67,'2026-06-01',NULL,NULL,NULL,'Rent installment - Month 11 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(214,9,9,'rent','bank_transfer',11666.67,'2026-07-01',NULL,NULL,NULL,'Rent installment - Month 12 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(215,9,9,'dewa','bank_transfer',493.96,'2025-08-01',NULL,NULL,NULL,'DEWA Utility Bill - Aug 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(216,9,9,'dewa','bank_transfer',564.38,'2025-09-01',NULL,NULL,NULL,'DEWA Utility Bill - Sep 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(217,9,9,'dewa','bank_transfer',415.97,'2025-10-01',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(218,9,9,'dewa','bank_transfer',458.63,'2025-11-01',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(219,9,9,'dewa','bank_transfer',610.43,'2025-12-01',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(220,9,9,'dewa','bank_transfer',597.12,'2026-01-01',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(221,10,5,'deposit','cheque',4583.33,'2025-10-01',NULL,NULL,NULL,'Security Deposit Payment',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(222,10,5,'rent','cash',4583.33,'2025-10-01',NULL,NULL,NULL,'Rent installment - Month 1 (Oct 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(223,10,5,'rent','bank_transfer',4583.33,'2025-11-01',NULL,NULL,NULL,'Rent installment - Month 2 (Nov 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(224,10,5,'rent','cash',4583.33,'2025-12-01',NULL,NULL,NULL,'Rent installment - Month 3 (Dec 2025)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(225,10,5,'rent','bank_transfer',4583.33,'2026-01-01',NULL,NULL,NULL,'Rent installment - Month 4 (Jan 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(226,10,5,'rent','cash',4583.33,'2026-02-01',NULL,NULL,NULL,'Rent installment - Month 5 (Feb 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(227,10,5,'rent','bank_transfer',4583.33,'2026-03-01',NULL,NULL,NULL,'Rent installment - Month 6 (Mar 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(228,10,5,'rent','cash',4583.33,'2026-04-01',NULL,NULL,NULL,'Rent installment - Month 7 (Apr 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(229,10,5,'rent','bank_transfer',4583.33,'2026-05-01',NULL,NULL,NULL,'Rent installment - Month 8 (May 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(230,10,5,'rent','cash',4583.33,'2026-06-01',NULL,NULL,NULL,'Rent installment - Month 9 (Jun 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(231,10,5,'rent','bank_transfer',4583.33,'2026-07-01',NULL,NULL,NULL,'Rent installment - Month 10 (Jul 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(232,10,5,'rent','cash',4583.33,'2026-08-01',NULL,NULL,NULL,'Rent installment - Month 11 (Aug 2026)',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(233,10,5,'dewa','bank_transfer',531.10,'2025-10-01',NULL,NULL,NULL,'DEWA Utility Bill - Oct 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(234,10,5,'dewa','bank_transfer',403.36,'2025-11-01',NULL,NULL,NULL,'DEWA Utility Bill - Nov 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(235,10,5,'dewa','bank_transfer',636.37,'2025-12-01',NULL,NULL,NULL,'DEWA Utility Bill - Dec 2025',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(236,10,5,'dewa','bank_transfer',490.16,'2026-01-01',NULL,NULL,NULL,'DEWA Utility Bill - Jan 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(237,10,5,'dewa','bank_transfer',489.56,'2026-02-01',NULL,NULL,NULL,'DEWA Utility Bill - Feb 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(238,10,5,'dewa','bank_transfer',473.86,'2026-03-01',NULL,NULL,NULL,'DEWA Utility Bill - Mar 2026',NULL,NULL,NULL,'2026-08-17 07:57:44','2026-08-17 07:57:44',NULL),
(239,2,2,'rent','cash',7500.00,'2026-08-18',NULL,NULL,NULL,'Real-Test Monthly Rent Installment via Cash',1,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51',NULL),
(240,2,2,'dewa','bank_transfer',620.50,'2026-08-18',NULL,NULL,NULL,'Real-Test DEWA Electricity & Water Clearance',1,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51',NULL),
(241,2,2,'deposit','cheque',5000.00,'2026-08-18',NULL,NULL,NULL,'Real-Test Refundable Security Deposit',1,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51',NULL),
(242,2,2,'rent','cash',7500.00,'2026-08-18',NULL,NULL,NULL,'Real-Test Monthly Rent Installment via Cash',1,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41',NULL),
(243,2,2,'dewa','bank_transfer',620.50,'2026-08-18',NULL,NULL,NULL,'Real-Test DEWA Electricity & Water Clearance',1,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41',NULL),
(244,2,2,'deposit','cheque',5000.00,'2026-08-18',NULL,NULL,NULL,'Real-Test Refundable Security Deposit',1,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41',NULL),
(245,2,2,'rent','cheque',20000.00,'2026-08-18',NULL,NULL,NULL,'PDC Cheque Cleared (CHQ-165874 - Emirates NBD)',NULL,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41',NULL),
(246,2,2,'other','cash',300.00,'2026-08-18',NULL,NULL,NULL,'Temporary duplicate payment to be deleted',NULL,1,'Client duplicated transaction entry error','2026-08-18 02:56:41','2026-08-18 02:56:41','2026-08-18 02:56:41'),
(247,2,2,'dewa','cash',80000.00,'2026-08-21',NULL,NULL,NULL,'nothig',1,NULL,NULL,'2026-08-21 11:31:49','2026-08-21 11:31:49',NULL),
(248,11,1,'rent','Cash',5000.00,'2026-08-21',NULL,NULL,NULL,'Deep test payment - monthly rent',1,NULL,NULL,'2026-08-21 12:22:07','2026-08-21 12:22:07',NULL),
(249,11,1,'rent','Cash',5000.00,'2026-08-21',NULL,NULL,NULL,'Deep test payment - monthly rent',1,NULL,NULL,'2026-08-21 12:27:58','2026-08-21 12:27:58',NULL),
(250,11,1,'rent','Cash',5000.00,'2026-08-21',NULL,NULL,NULL,'Deep test payment - monthly rent',1,NULL,NULL,'2026-08-21 12:28:55','2026-08-21 12:28:55',NULL),
(251,18,1,'rent','cheque',23750.00,'2026-09-01',NULL,NULL,NULL,'First quarter instalment (CHQ-501101 cleared)',1,NULL,NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31',NULL),
(252,20,1,'rent','cheque',23750.00,'2026-09-01',NULL,NULL,NULL,'First quarter instalment (CHQ-501101 cleared)',1,NULL,NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28',NULL),
(253,22,1,'rent','cheque',23750.00,'2026-09-01',NULL,NULL,NULL,'First quarter instalment (CHQ-501101 cleared)',1,NULL,NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27',NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES
(1,'App\\Models\\User',1,'auth_token','66403dfb36c9ba09d8de76ac97bf338ce0d1c421ec904a0566071ff568f628c1','[\"*\"]','2026-08-10 04:29:26',NULL,'2026-08-10 04:29:16','2026-08-10 04:29:26'),
(2,'App\\Models\\User',3,'auth_token','96ed9728339d047e9c25bd77a07a02cc3d743792007ed456e003c65ffd259f8f','[\"*\"]','2026-08-10 04:29:17',NULL,'2026-08-10 04:29:16','2026-08-10 04:29:17'),
(3,'App\\Models\\User',9,'auth_token','e07a582faef335b28ef947a2db419f39b3747bfc7efb5f2ac02b54b4a2f4d9ff','[\"*\"]','2026-08-10 04:29:17',NULL,'2026-08-10 04:29:17','2026-08-10 04:29:17'),
(5,'App\\Models\\User',1,'auth_token','8dc394bad7d9770e3ef405ee35ca2894bb36ee92023de5fc0ef9f224cb24f2a6','[\"*\"]','2026-08-10 04:30:53',NULL,'2026-08-10 04:30:46','2026-08-10 04:30:53'),
(6,'App\\Models\\User',3,'auth_token','ba183272e2fa23d6aed1f99365c519f05910b4c606443875862d84d548524192','[\"*\"]','2026-08-10 04:30:48',NULL,'2026-08-10 04:30:47','2026-08-10 04:30:48'),
(7,'App\\Models\\User',9,'auth_token','93f9bee3ede93b83785aa0b5557a9c227973d3e416ee169ed7d332f27dc8cf7a','[\"*\"]','2026-08-10 04:30:48',NULL,'2026-08-10 04:30:48','2026-08-10 04:30:48'),
(18,'App\\Models\\User',1,'auth_token','0f2c786704afd94d84bb3acf8a8a10a0f2107d3c3488625d6f33bae6ef45253d','[\"*\"]','2026-08-16 14:22:16',NULL,'2026-08-16 09:17:05','2026-08-16 14:22:16'),
(26,'App\\Models\\User',1,'auth_token','c6056138f2a6f1449a1cf0baace2e7ed7d93aba7f590b0f21103741c0a6c87bb','[\"*\"]','2026-08-17 07:54:15',NULL,'2026-08-16 15:00:12','2026-08-17 07:54:15'),
(27,'App\\Models\\User',1,'test-admin','784c24364e63a72577399cd7ad5a26496629dc81bf3ae0e44fbae46d00ee6ba1','[\"*\"]',NULL,NULL,'2026-08-17 03:02:23','2026-08-17 03:02:23'),
(28,'App\\Models\\User',3,'test-owner','21f11d885da37813de954475a5d36c9f11ece9511fa1cc3b0f606ba9a05c823e','[\"*\"]',NULL,NULL,'2026-08-17 03:02:23','2026-08-17 03:02:23'),
(29,'App\\Models\\User',5,'test-tenant','b4cf3e39ab8aaad5381003d8204fc7cf287beda5d47ac0e87cbedfd9f3378e79','[\"*\"]',NULL,NULL,'2026-08-17 03:02:23','2026-08-17 03:02:23'),
(30,'App\\Models\\User',2,'test-maintenance','5959a38021e7856cd0413491d10088811702c513b00244ca3636283f58f4beef','[\"*\"]',NULL,NULL,'2026-08-17 03:02:23','2026-08-17 03:02:23'),
(31,'App\\Models\\User',1,'auth_token','1b82c97ddf577bfb155fb27a45bd8652920f855b412cc8bb39f931d6ac912cf8','[\"*\"]',NULL,NULL,'2026-08-17 03:04:53','2026-08-17 03:04:53'),
(32,'App\\Models\\User',3,'auth_token','3ae351d4837b02e933886ce7c684117a7c6a8376d8207687af8cf1ff74ec5ef9','[\"*\"]',NULL,NULL,'2026-08-17 03:04:54','2026-08-17 03:04:54'),
(33,'App\\Models\\User',5,'auth_token','5ded848a54ec9993d77d82c1d3f45e11f065e766df64cadb1dff0ba4fd0126ea','[\"*\"]',NULL,NULL,'2026-08-17 03:04:55','2026-08-17 03:04:55'),
(34,'App\\Models\\User',2,'auth_token','a7e4dbb955d2310c7b6cca40ada22a3b75c8d156ded84304f30d095c657ca9ea','[\"*\"]',NULL,NULL,'2026-08-17 03:04:55','2026-08-17 03:04:55'),
(35,'App\\Models\\User',1,'test-admin','5f1b4f72852176eb6b6b292a174fd73502c7c0c36e62217ab4511cdee11a2975','[\"*\"]',NULL,NULL,'2026-08-17 03:05:27','2026-08-17 03:05:27'),
(36,'App\\Models\\User',3,'test-owner','bfa8d82a7753a3df242fe28538d407839e7bc10495680688ad36373ee903f7b8','[\"*\"]',NULL,NULL,'2026-08-17 03:05:27','2026-08-17 03:05:27'),
(37,'App\\Models\\User',5,'test-tenant','460d4fcb7fbc45ebbc6981816137e67b4b03f8ccd72daaa07a55a9d4d36d639f','[\"*\"]',NULL,NULL,'2026-08-17 03:05:27','2026-08-17 03:05:27'),
(38,'App\\Models\\User',2,'test-maintenance','8d9342b4ee92db4c822570a3f225de3183bb99cea548c283075dff6caf707f0e','[\"*\"]',NULL,NULL,'2026-08-17 03:05:27','2026-08-17 03:05:27'),
(39,'App\\Models\\User',1,'auth_token','67a0e8436e1f6ca89d6dcd4f80e2ac442d803f31ff34d82459597201dce61849','[\"*\"]','2026-08-17 07:57:47',NULL,'2026-08-17 07:57:45','2026-08-17 07:57:47'),
(40,'App\\Models\\User',10,'auth_token','99e4bbecbddb049dae93bba29a1b712d41ab77aab1d871d657a13bc907335e0c','[\"*\"]',NULL,NULL,'2026-08-17 07:57:48','2026-08-17 07:57:48'),
(41,'App\\Models\\User',14,'auth_token','d903ebb1b22b7d77a534901846a9b6f2bed879f965906a6eebe16aca6f6b8a51','[\"*\"]',NULL,NULL,'2026-08-17 07:57:49','2026-08-17 07:57:49'),
(42,'App\\Models\\User',2,'auth_token','2cc2725d58e829ab685f3a0d6b08744c7df8ccddaebbd6b8f8a89aefcc1874a3','[\"*\"]',NULL,NULL,'2026-08-17 07:57:49','2026-08-17 07:57:49'),
(43,'App\\Models\\User',1,'auth_token','e69613a1e28305240477935050f450602b9caa22b00adb6208ab34f07dc83e31','[\"*\"]','2026-08-18 02:16:37',NULL,'2026-08-18 02:16:34','2026-08-18 02:16:37'),
(44,'App\\Models\\User',10,'auth_token','d40741d9d4e8257f03515fb7513d2249848c4b92d313ab24d751573ed76e9b7c','[\"*\"]','2026-08-18 02:16:39',NULL,'2026-08-18 02:16:38','2026-08-18 02:16:39'),
(45,'App\\Models\\User',14,'auth_token','b024ec6116ad892e2aefef3913544114a7a254573c3f0071a3fe9e0f714c6c43','[\"*\"]','2026-08-18 02:16:42',NULL,'2026-08-18 02:16:41','2026-08-18 02:16:42'),
(46,'App\\Models\\User',2,'auth_token','2448f13608a2d1cabfa495f19a5233282457164fb1325b88bb1c5f65435ef45c','[\"*\"]','2026-08-18 02:16:44',NULL,'2026-08-18 02:16:43','2026-08-18 02:16:44'),
(47,'App\\Models\\User',1,'auth_token','6c1fee3ef940d4140f48883396d4ff7da39dd060a2ba6dd354eb9810b748503e','[\"*\"]',NULL,NULL,'2026-08-18 02:20:13','2026-08-18 02:20:13'),
(48,'App\\Models\\User',1,'auth_token','8f5851d143eb6e222d0c4b113c3c3ba7917ded3068f7a7f91adb85b4ef3777b6','[\"*\"]',NULL,NULL,'2026-08-18 02:30:25','2026-08-18 02:30:25'),
(50,'App\\Models\\User',1,'auth_token','295db06464bcfd1bfb2272c6b09e3227f89312435018ad998589eab539a4771d','[\"*\"]','2026-08-18 02:52:51',NULL,'2026-08-18 02:52:49','2026-08-18 02:52:51'),
(51,'App\\Models\\User',1,'auth_token','735014c22071b72cb79ceb298a47c823b2cbf30ffdce49e7a8d31e5d7d6fbd47','[\"*\"]','2026-08-18 02:56:41',NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41'),
(52,'App\\Models\\User',3,'auth_token','2ff795a7f1d7d429ee2025c879b545245e4acad0394cd2aff41b42de86f8a500','[\"*\"]','2026-08-18 02:56:43',NULL,'2026-08-18 02:56:43','2026-08-18 02:56:43'),
(53,'App\\Models\\User',5,'auth_token','3c7f10373928f8ff4639100188d9e65575b9e90ec0f4dc03a298f22a5d4f6bf7','[\"*\"]','2026-08-18 02:56:44',NULL,'2026-08-18 02:56:44','2026-08-18 02:56:44'),
(65,'App\\Models\\User',1,'auth_token','aac31a75ddf46e4e6816f62ea9b3c75f4f0d29f87ce8d33a4f33bb809d9837ef','[\"*\"]','2026-08-20 12:22:44',NULL,'2026-08-20 12:22:44','2026-08-20 12:22:44'),
(66,'App\\Models\\User',1,'t','5104a6327aa132eadfe2ea38fb38c76f3e4d1ee6260d14f8fb89f56966649efd','[\"*\"]','2026-08-21 03:56:37',NULL,'2026-08-21 03:56:37','2026-08-21 03:56:37'),
(67,'App\\Models\\User',1,'test','39f74136e602e24c63c482091d7bebf8bc23156d0432e9b7e5e585b2ab588f61','[\"*\"]','2026-08-21 03:57:31',NULL,'2026-08-21 03:57:31','2026-08-21 03:57:31'),
(70,'App\\Models\\User',1,'test','4439e3b48c68345718033084bd08e450053551e4bfb669a35c381644a7c03a09','[\"*\"]','2026-08-21 07:38:13',NULL,'2026-08-21 07:38:12','2026-08-21 07:38:13'),
(77,'App\\Models\\User',1,'auth_token','100ea45312ba9e1a64239a350be74e90667eaefec863e97d0d15a62a40ed9d88','[\"*\"]',NULL,NULL,'2026-08-22 00:15:31','2026-08-22 00:15:31'),
(78,'App\\Models\\User',3,'auth_token','3511c0d84d8a673f3b08b582258acfd59b03bf1d1c33738f8ef8469e2f3872e2','[\"*\"]',NULL,NULL,'2026-08-22 00:15:50','2026-08-22 00:15:50'),
(79,'App\\Models\\User',5,'auth_token','b2d1a80e171bfdd9f179dd121a73cfa906d30e4a892fbfd051b138e2be99aded','[\"*\"]',NULL,NULL,'2026-08-22 00:17:15','2026-08-22 00:17:15'),
(80,'App\\Models\\User',2,'auth_token','7e90937b70896a05e235d8b05af369ca8a84262ae2628c41c882905062790650','[\"*\"]',NULL,NULL,'2026-08-22 00:17:15','2026-08-22 00:17:15'),
(81,'App\\Models\\User',1,'auth_token','2698b8480a751a854fff213cddbb5d0c3b95013a4286e862628eb67e5c374062','[\"*\"]',NULL,NULL,'2026-08-22 00:21:41','2026-08-22 00:21:41'),
(82,'App\\Models\\User',1,'auth_token','867f43dd0b80fca67b87dab82fbb869417fc56cfadd4bf1c299f2f36489a21fe','[\"*\"]',NULL,NULL,'2026-08-24 04:21:58','2026-08-24 04:21:58'),
(83,'App\\Models\\User',1,'auth_token','6992fd96ec275827162197078459ca4d9cba63056cb602909535c580363d7856','[\"*\"]',NULL,NULL,'2026-08-24 04:24:12','2026-08-24 04:24:12'),
(84,'App\\Models\\User',3,'auth_token','855df7dbb24cabdfbc979fce1047c7876e3d1ab8c2d159d62ed8f5b9d18b4be6','[\"*\"]',NULL,NULL,'2026-08-24 04:24:30','2026-08-24 04:24:30'),
(85,'App\\Models\\User',5,'auth_token','2e193bcbf7c6cec7a62e7a5abcef5c090ac715d36b8c6746d26b18cfeb7a062d','[\"*\"]',NULL,NULL,'2026-08-24 04:24:31','2026-08-24 04:24:31'),
(86,'App\\Models\\User',2,'auth_token','cfad728a7691c364204cdb193a0a140fc2e3694c6685ede45f87f636147acff2','[\"*\"]',NULL,NULL,'2026-08-24 04:24:32','2026-08-24 04:24:32'),
(87,'App\\Models\\User',1,'auth_token','67acd1c0fd6454c59fe351d212d74dbfc39329d9c2b60d10fe7c3660fc9c13a5','[\"*\"]',NULL,NULL,'2026-08-24 04:25:13','2026-08-24 04:25:13'),
(88,'App\\Models\\User',1,'auth_token','92350aa7f194644fd9b9291346e31c6ac843a841d76e23dc07929b04334e042a','[\"*\"]','2026-08-24 04:25:47',NULL,'2026-08-24 04:25:44','2026-08-24 04:25:47');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('residential','commercial','mixed') NOT NULL,
  `total_units` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `properties_owner_id_foreign` (`owner_id`),
  CONSTRAINT `properties_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES
(1,1,'Marina Tower','Marina Walk 1','Dubai','Waterfront','residential',2,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,1,'JLT Heights','Cluster X','Dubai','Lake view','residential',2,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(3,2,'Bay Office','BB Avenue','Dubai','Commercial','commercial',2,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(4,1,'flat','burjkhalifa','dubai',NULL,'residential',1,'2026-08-16 14:34:50','2026-08-16 14:41:46'),
(5,1,'Al Barsha Residence Tower','Al Barsha 1, Sheikh Zayed Road','Dubai',NULL,'residential',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(6,2,'DIFC Business Centre','Gate District 4, DIFC','Dubai',NULL,'commercial',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(7,3,'Jumeirah Living Suites','Jumeirah Beach Road, Jumeirah 1','Dubai',NULL,'residential',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(8,3,'Silicon Oasis Tech Park','Dubai Silicon Oasis, Phase 2','Dubai',NULL,'commercial',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(9,1,'Sports City Apartments','Dubai Sports City, Victory Heights','Dubai',NULL,'residential',0,'2026-08-17 03:12:23','2026-08-17 03:12:23'),
(10,1,'Emaar Downtown Residences','Downtown Boulevard, Plot 405','Dubai',NULL,'residential',20,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(11,1,'Emaar Downtown Residences','Downtown Boulevard, Plot 405','Dubai',NULL,'residential',20,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(12,1,'Emaar Downtown Residences','Downtown Boulevard, Plot 405','Dubai',NULL,'residential',20,'2026-08-21 22:59:26','2026-08-21 22:59:26'),
(15,4,'jat','5a','dubai',NULL,'commercial',1,'2026-08-25 08:04:58','2026-08-25 08:06:22');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `purchase_items`
--

DROP TABLE IF EXISTS `purchase_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `purchase_id` bigint(20) unsigned NOT NULL,
  `item_id` bigint(20) unsigned DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_items_purchase_id_foreign` (`purchase_id`),
  KEY `purchase_items_item_id_index` (`item_id`),
  CONSTRAINT `purchase_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `purchase_items_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `purchase_items` WRITE;
/*!40000 ALTER TABLE `purchase_items` DISABLE KEYS */;
INSERT INTO `purchase_items` VALUES
(1,1,1,'Split AC Filters',10,150.00,'2026-08-10 04:22:38','2026-08-10 04:22:38');
/*!40000 ALTER TABLE `purchase_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) NOT NULL,
  `purchase_date` date DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES
(1,'Gulf Supplies','2026-08-10',1500.00,'received','Verification seed PO','2026-08-10 04:22:38','2026-08-21 11:23:50'),
(2,'Danube Home Trading LLC','2026-08-22',4500.00,'approved','AC Compressor and filters stock','2026-08-21 22:55:28','2026-08-21 22:55:28'),
(3,'Danube Home Trading LLC','2026-08-22',4500.00,'approved','AC Compressor and filters stock','2026-08-21 22:59:27','2026-08-21 22:59:27');
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `queue_jobs`
--

DROP TABLE IF EXISTS `queue_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `queue_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `queue_jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `queue_jobs` WRITE;
/*!40000 ALTER TABLE `queue_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `queue_jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `rent_transactions`
--

DROP TABLE IF EXISTS `rent_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rent_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `payment_id` bigint(20) unsigned DEFAULT NULL,
  `date` date NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `debit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `credit` decimal(12,2) NOT NULL DEFAULT 0.00,
  `deleted_by` bigint(20) unsigned DEFAULT NULL,
  `deletion_reason` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rent_transactions_contract_id_date_index` (`contract_id`,`date`),
  KEY `rent_transactions_payment_id_foreign` (`payment_id`),
  CONSTRAINT `rent_transactions_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rent_transactions_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rent_transactions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `rent_transactions` WRITE;
/*!40000 ALTER TABLE `rent_transactions` DISABLE KEYS */;
INSERT INTO `rent_transactions` VALUES
(1,1,NULL,'2026-08-01','Rent due 2026-08',55000.00,0.00,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,1,NULL,'2026-08-10','Partial rent payment',0.00,20000.00,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(3,2,NULL,'2026-08-01','Rent due 2026-08',80000.00,0.00,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(4,2,239,'2026-08-18','RENT payment',0.00,7500.00,NULL,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51'),
(5,2,240,'2026-08-18','DEWA payment',0.00,620.50,NULL,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51'),
(6,2,241,'2026-08-18','DEPOSIT payment',0.00,5000.00,NULL,NULL,NULL,'2026-08-18 02:52:51','2026-08-18 02:52:51'),
(7,2,242,'2026-08-18','RENT payment',0.00,7500.00,NULL,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41'),
(8,2,243,'2026-08-18','DEWA payment',0.00,620.50,NULL,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41'),
(9,2,244,'2026-08-18','DEPOSIT payment',0.00,5000.00,NULL,NULL,NULL,'2026-08-18 02:56:41','2026-08-18 02:56:41'),
(10,2,247,'2026-08-21','DEWA payment',0.00,80000.00,NULL,NULL,NULL,'2026-08-21 11:31:49','2026-08-21 11:31:49'),
(11,11,NULL,'2026-09-01','Rent due 2026-09',60000.00,0.00,NULL,NULL,NULL,'2026-08-21 11:53:59','2026-08-21 11:53:59'),
(12,12,NULL,'2026-10-01','Rent due 2026-10',120000.00,0.00,NULL,NULL,NULL,'2026-08-21 11:53:59','2026-08-21 11:53:59'),
(13,13,NULL,'2026-11-01','Rent due 2026-11',36000.00,0.00,NULL,NULL,NULL,'2026-08-21 11:53:59','2026-08-21 11:53:59'),
(14,4,NULL,'2026-08-01','Rent due 2026-08',130000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(15,5,NULL,'2026-08-01','Rent due 2026-08',85000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(16,6,NULL,'2026-08-01','Rent due 2026-08',130000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(17,7,NULL,'2026-08-01','Rent due 2026-08',220000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(18,9,NULL,'2026-08-01','Rent due 2026-08',140000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(19,10,NULL,'2026-08-01','Rent due 2026-08',55000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(20,11,NULL,'2026-08-01','Rent due 2026-08',60000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(21,12,NULL,'2026-08-01','Rent due 2026-08',120000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(22,13,NULL,'2026-08-01','Rent due 2026-08',36000.00,0.00,NULL,NULL,NULL,'2026-08-21 12:17:53','2026-08-21 12:17:53'),
(23,18,NULL,'2026-09-01','Rent due 2026-09',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(24,18,251,'2026-09-01','Payment received (CHQ-501101)',0.00,23750.00,NULL,NULL,NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(25,18,NULL,'2026-08-01','Rent due 2026-08',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:54:32','2026-08-21 22:54:32'),
(26,20,NULL,'2026-09-01','Rent due 2026-09',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(27,20,252,'2026-09-01','Payment received (CHQ-501101)',0.00,23750.00,NULL,NULL,NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(28,20,NULL,'2026-08-01','Rent due 2026-08',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:55:29','2026-08-21 22:55:29'),
(29,22,NULL,'2026-09-01','Rent due 2026-09',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:59:26','2026-08-21 22:59:26'),
(30,22,253,'2026-09-01','Payment received (CHQ-501101)',0.00,23750.00,NULL,NULL,NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(31,22,NULL,'2026-08-01','Rent due 2026-08',95000.00,0.00,NULL,NULL,NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(32,24,NULL,'2026-08-01','Rent due 2026-08',20000.00,0.00,NULL,NULL,NULL,'2026-08-21 23:30:19','2026-08-21 23:30:19'),
(33,25,NULL,'2026-08-01','Rent due 2026-08',4000.00,0.00,NULL,NULL,NULL,'2026-08-25 08:10:26','2026-08-25 08:10:26');
/*!40000 ALTER TABLE `rent_transactions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `service_charge_payments`
--

DROP TABLE IF EXISTS `service_charge_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_charge_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `service_charge_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_charge_payments_service_charge_id_foreign` (`service_charge_id`),
  CONSTRAINT `service_charge_payments_service_charge_id_foreign` FOREIGN KEY (`service_charge_id`) REFERENCES `service_charges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_charge_payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `service_charge_payments` WRITE;
/*!40000 ALTER TABLE `service_charge_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_charge_payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `service_charges`
--

DROP TABLE IF EXISTS `service_charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_charges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `unit_id` bigint(20) unsigned NOT NULL,
  `charge_type` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `paid_date` date DEFAULT NULL,
  `status` enum('pending','paid','waived') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_charges_contract_id_foreign` (`contract_id`),
  KEY `service_charges_unit_id_foreign` (`unit_id`),
  CONSTRAINT `service_charges_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `service_charges_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_charges`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `service_charges` WRITE;
/*!40000 ALTER TABLE `service_charges` DISABLE KEYS */;
INSERT INTO `service_charges` VALUES
(1,1,1,'maintenance',500.00,'2026-08-25',NULL,'pending',NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,11,1,'maintenance',250.00,'2026-09-04',NULL,'pending','Deep test elevator charge','2026-08-21 12:22:07','2026-08-21 12:22:07'),
(3,11,1,'maintenance',250.00,'2026-09-04',NULL,'pending','Deep test elevator charge','2026-08-21 12:27:58','2026-08-21 12:27:58'),
(4,11,1,'maintenance',250.00,'2026-09-04',NULL,'pending','Deep test elevator charge','2026-08-21 12:28:55','2026-08-21 12:28:55'),
(5,18,20,'chiller_ac',1200.00,'2026-09-15',NULL,'waived','Q3 Empower/District Cooling charges','2026-08-21 22:54:31','2026-08-21 22:58:26'),
(6,20,22,'chiller_ac',1200.00,'2026-09-15',NULL,'pending','Q3 Empower/District Cooling charges','2026-08-21 22:55:28','2026-08-21 22:55:28'),
(7,22,24,'chiller_ac',1200.00,'2026-09-15',NULL,'pending','Q3 Empower/District Cooling charges','2026-08-21 22:59:27','2026-08-21 22:59:27');
/*!40000 ALTER TABLE `service_charges` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `settlement_docs`
--

DROP TABLE IF EXISTS `settlement_docs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlement_docs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `settlement_id` bigint(20) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `settlement_docs_settlement_id_foreign` (`settlement_id`),
  CONSTRAINT `settlement_docs_settlement_id_foreign` FOREIGN KEY (`settlement_id`) REFERENCES `settlements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlement_docs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `settlement_docs` WRITE;
/*!40000 ALTER TABLE `settlement_docs` DISABLE KEYS */;
/*!40000 ALTER TABLE `settlement_docs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `settlement_payments`
--

DROP TABLE IF EXISTS `settlement_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlement_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `settlement_id` bigint(20) unsigned NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `settlement_payments_settlement_id_foreign` (`settlement_id`),
  CONSTRAINT `settlement_payments_settlement_id_foreign` FOREIGN KEY (`settlement_id`) REFERENCES `settlements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlement_payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `settlement_payments` WRITE;
/*!40000 ALTER TABLE `settlement_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `settlement_payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `settlements`
--

DROP TABLE IF EXISTS `settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settlements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint(20) unsigned DEFAULT NULL,
  `contract_id` bigint(20) unsigned DEFAULT NULL,
  `vacant_date` date DEFAULT NULL,
  `dues` decimal(12,2) NOT NULL DEFAULT 0.00,
  `receivable` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','completed') NOT NULL DEFAULT 'pending',
  `on_case` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `settlements_owner_id_foreign` (`owner_id`),
  KEY `settlements_contract_id_foreign` (`contract_id`),
  CONSTRAINT `settlements_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `settlements_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settlements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `settlements` WRITE;
/*!40000 ALTER TABLE `settlements` DISABLE KEYS */;
INSERT INTO `settlements` VALUES
(1,1,NULL,'2026-08-10',5000.00,2000.00,'pending',0,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,NULL,19,NULL,0.00,0.00,'completed',0,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(3,NULL,21,NULL,0.00,0.00,'completed',0,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(4,NULL,23,NULL,0.00,0.00,'completed',0,'2026-08-21 22:59:27','2026-08-21 22:59:27');
/*!40000 ALTER TABLE `settlements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES
(1,'Alpha Team','0509999999','Primary','2026-08-10 04:22:38','2026-08-10 04:22:38');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tenancy_contracts`
--

DROP TABLE IF EXISTS `tenancy_contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenancy_contracts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `c1` text DEFAULT NULL,
  `c2` text DEFAULT NULL,
  `c3` text DEFAULT NULL,
  `c4` text DEFAULT NULL,
  `c5` text DEFAULT NULL,
  `c6` text DEFAULT NULL,
  `c7` text DEFAULT NULL,
  `c8` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenancy_contracts_contract_id_foreign` (`contract_id`),
  CONSTRAINT `tenancy_contracts_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenancy_contracts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tenancy_contracts` WRITE;
/*!40000 ALTER TABLE `tenancy_contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenancy_contracts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tenancy_res`
--

DROP TABLE IF EXISTS `tenancy_res`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenancy_res` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `lessor_name` varchar(255) DEFAULT NULL,
  `lessor_emirates_id` varchar(255) DEFAULT NULL,
  `lessor_license_no` varchar(255) DEFAULT NULL,
  `lessor_email` varchar(255) DEFAULT NULL,
  `lessor_phone` varchar(255) DEFAULT NULL,
  `tenant_name` varchar(255) DEFAULT NULL,
  `tenant_emirates_id` varchar(255) DEFAULT NULL,
  `tenant_license_no` varchar(255) DEFAULT NULL,
  `tenant_email` varchar(255) DEFAULT NULL,
  `tenant_phone` varchar(255) DEFAULT NULL,
  `plot_no` varchar(255) DEFAULT NULL,
  `property_name` varchar(255) DEFAULT NULL,
  `property_usage` varchar(255) DEFAULT NULL,
  `property_area` varchar(255) DEFAULT NULL,
  `premises_no` varchar(255) DEFAULT NULL,
  `property_type` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `annual_rent` decimal(12,2) DEFAULT NULL,
  `period_from` date DEFAULT NULL,
  `period_to` date DEFAULT NULL,
  `security_deposit` decimal(12,2) DEFAULT NULL,
  `mode_of_payment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenancy_res_contract_id_foreign` (`contract_id`),
  CONSTRAINT `tenancy_res_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenancy_res`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tenancy_res` WRITE;
/*!40000 ALTER TABLE `tenancy_res` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenancy_res` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `emirates_id` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `passport_number` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenants_user_id_foreign` (`user_id`),
  CONSTRAINT `tenants_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES
(1,5,NULL,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-21 23:09:54','Tenant One','tenant@gofreehold.com','Dubai Marina','0503333333'),
(2,6,NULL,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38','Tenant Two','tenant2@gofreehold.com','JLT','0504444444'),
(3,7,NULL,NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38','Tenant Three','tenant3@gofreehold.com','Business Bay','0505555555'),
(4,5,NULL,'',NULL,NULL,'2026-08-17 03:02:21','2026-08-17 03:02:21','Tenant One','tenant1@gofreehold.com',NULL,NULL),
(5,14,'784-1990-1234567-1','+971551001001','UAE','A12345678','2026-08-17 07:54:17','2026-08-17 07:54:17','Ahmed Hassan Al Farsi','a.farsi@gfh.com',NULL,'+971551001001'),
(6,15,'784-1988-7654321-2','+971551001002','Pakistani','PK8765432','2026-08-17 07:54:18','2026-08-17 07:54:18','Samira Binte Malik','s.malik@gfh.com',NULL,'+971551001002'),
(7,16,'784-1992-1122334-3','+971551001003','Indian','N5432198','2026-08-17 07:54:20','2026-08-17 07:54:20','Raj Kumar Patel','r.patel@gfh.com',NULL,'+971551001003'),
(8,17,'784-1985-9988776-4','+971551001004','Spanish','XDA123456','2026-08-17 07:54:21','2026-08-17 07:54:21','Elena Vasquez Torres','e.torres@gfh.com',NULL,'+971551001004'),
(9,18,'784-1991-4455667-5','+971551001005','Ghanaian','G0234567','2026-08-17 07:54:22','2026-08-17 07:54:22','James Kwame Osei','j.osei@gfh.com',NULL,'+971551001005');
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `terms`
--

DROP TABLE IF EXISTS `terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `terms` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `cid` bigint(20) unsigned NOT NULL,
  `terms` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `terms_cid_foreign` (`cid`),
  CONSTRAINT `terms_cid_foreign` FOREIGN KEY (`cid`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `terms`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `terms` WRITE;
/*!40000 ALTER TABLE `terms` DISABLE KEYS */;
/*!40000 ALTER TABLE `terms` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `unit_items`
--

DROP TABLE IF EXISTS `unit_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` bigint(20) unsigned NOT NULL,
  `item_id` bigint(20) unsigned NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `serial` varchar(255) DEFAULT NULL,
  `warranty` varchar(255) DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `unit_items_unit_id_foreign` (`unit_id`),
  KEY `unit_items_item_id_foreign` (`item_id`),
  CONSTRAINT `unit_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `unit_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `unit_items` WRITE;
/*!40000 ALTER TABLE `unit_items` DISABLE KEYS */;
INSERT INTO `unit_items` VALUES
(1,1,1,1,'SN-AC-1',NULL,NULL,NULL,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(2,1,1,1,'TEST-SN-001',NULL,'Deep test item',NULL,'2026-08-21 12:22:07','2026-08-21 12:22:07'),
(3,1,1,1,'TEST-SN-001',NULL,'Deep test item',NULL,'2026-08-21 12:27:58','2026-08-21 12:27:58'),
(4,1,1,1,'TEST-SN-001',NULL,'Deep test item',NULL,'2026-08-21 12:28:56','2026-08-21 12:28:56'),
(5,20,1,1,'SN-BOSCH-COOKER-901',NULL,'Bosch 4-Burner Gas Cooker',NULL,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(6,22,1,1,'SN-BOSCH-COOKER-901',NULL,'Bosch 4-Burner Gas Cooker',NULL,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(7,24,1,1,'SN-BOSCH-COOKER-901',NULL,'Bosch 4-Burner Gas Cooker',NULL,'2026-08-21 22:59:27','2026-08-21 22:59:27');
/*!40000 ALTER TABLE `unit_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `units` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `property_id` bigint(20) unsigned NOT NULL,
  `owner_id` bigint(20) unsigned NOT NULL,
  `number` varchar(255) NOT NULL,
  `dhewa_no` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `floor` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `size` decimal(12,2) DEFAULT NULL,
  `furnished` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('AVAILABLE','BOOKED','OCCUPIED','SOLD') NOT NULL DEFAULT 'AVAILABLE',
  `price` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `units_property_id_foreign` (`property_id`),
  KEY `units_owner_id_foreign` (`owner_id`),
  CONSTRAINT `units_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`id`) ON DELETE CASCADE,
  CONSTRAINT `units_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES
(1,1,1,'101',NULL,NULL,1,'1BR',750.00,1,'OCCUPIED',55000.00,'2026-08-10 04:22:38','2026-08-21 11:53:59'),
(2,1,1,'102',NULL,NULL,1,'studio',450.00,0,'OCCUPIED',40000.00,'2026-08-10 04:22:38','2026-08-21 11:53:59'),
(3,2,1,'201',NULL,NULL,2,'2BR',1100.00,1,'OCCUPIED',80000.00,'2026-08-10 04:22:38','2026-08-21 11:53:59'),
(4,2,1,'202',NULL,NULL,2,'1BR',800.00,1,'BOOKED',60000.00,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(5,3,2,'A1',NULL,NULL,5,'office',1200.00,0,'OCCUPIED',120000.00,'2026-08-10 04:22:38','2026-08-21 23:30:19'),
(6,3,2,'A2',NULL,NULL,5,'office',900.00,0,'SOLD',95000.00,'2026-08-10 04:22:38','2026-08-10 04:22:38'),
(7,4,1,'1001',NULL,NULL,1,'apartment',120.00,0,'AVAILABLE',2000.00,'2026-08-16 14:41:46','2026-08-21 12:28:55'),
(8,5,1,'501',NULL,'apartment',5,'1BR',750.00,0,'AVAILABLE',60000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(9,5,1,'502',NULL,'apartment',5,'2BR',1100.00,0,'OCCUPIED',85000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(10,5,1,'1001',NULL,'apartment',10,'3BR',1800.00,0,'OCCUPIED',130000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(11,5,1,'1501',NULL,'apartment',15,'studio',450.00,0,'AVAILABLE',42000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(12,6,2,'B101',NULL,'apartment',1,'office',2500.00,0,'OCCUPIED',220000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(13,6,2,'B202',NULL,'apartment',2,'office',1800.00,0,'AVAILABLE',170000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(14,7,3,'J01',NULL,'apartment',1,'1BR',900.00,0,'OCCUPIED',95000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(15,7,3,'J02',NULL,'apartment',1,'2BR',1400.00,0,'OCCUPIED',140000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(16,7,3,'J03',NULL,'apartment',8,'penthouse',3200.00,0,'AVAILABLE',320000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(17,8,3,'SO-A1',NULL,'apartment',1,'office',3000.00,0,'OCCUPIED',180000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(18,9,1,'SC201',NULL,'apartment',2,'1BR',820.00,0,'OCCUPIED',55000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(19,9,1,'SC202',NULL,'apartment',2,'studio',480.00,0,'AVAILABLE',38000.00,'2026-08-17 07:57:43','2026-08-17 07:57:43'),
(20,10,1,'1402','9988776655','Residential',14,'2BR Luxury Apartment',125.50,1,'OCCUPIED',95000.00,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(21,1,1,'999-TEMP',NULL,'Residential',9,'1BR',NULL,0,'AVAILABLE',50000.00,'2026-08-21 22:54:31','2026-08-21 22:54:31'),
(22,11,1,'1402','9988776655','Residential',14,'2BR Luxury Apartment',125.50,1,'OCCUPIED',95000.00,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(23,1,1,'999-TEMP',NULL,'Residential',9,'1BR',NULL,0,'AVAILABLE',50000.00,'2026-08-21 22:55:28','2026-08-21 22:55:28'),
(24,12,1,'1402','9988776655','Residential',14,'2BR Luxury Apartment',125.50,1,'OCCUPIED',95000.00,'2026-08-21 22:59:26','2026-08-21 22:59:26'),
(25,1,1,'999-TEMP',NULL,'Residential',9,'1BR',NULL,0,'AVAILABLE',50000.00,'2026-08-21 22:59:27','2026-08-21 22:59:27'),
(26,15,4,'1',NULL,NULL,2,'apartment',5.00,0,'OCCUPIED',30000.00,'2026-08-25 08:06:22','2026-08-25 08:10:26');
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','maintenance','owner','tenant') NOT NULL DEFAULT 'tenant',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Admin User','admin@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','admin',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43'),
(2,'Maintenance User','maintenance@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','maintenance',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43'),
(3,'Owner One','owner1@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43'),
(4,'Owner Two','owner2@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43'),
(5,'Tenant One','tenant1@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43'),
(6,'Tenant Two','tenant2@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43'),
(7,'Tenant Three','tenant3@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43'),
(8,'Owner User','owner@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43'),
(9,'Tenant User','tenant@gofreehold.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-10 04:22:01','2026-08-21 23:45:43'),
(10,'Mohammed Al Rashidi','m.rashidi@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-17 03:13:32','2026-08-21 23:45:43'),
(11,'Khalid Ibrahim Saeed','k.saeed@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-17 07:54:12','2026-08-21 23:45:43'),
(12,'Priya Nair Menon','p.menon@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-17 07:54:13','2026-08-21 23:45:43'),
(13,'David James Carter','d.carter@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','owner',NULL,'2026-08-17 07:54:15','2026-08-21 23:45:43'),
(14,'Ahmed Hassan Al Farsi','a.farsi@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:16','2026-08-21 23:45:43'),
(15,'Samira Binte Malik','s.malik@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:17','2026-08-21 23:45:43'),
(16,'Raj Kumar Patel','r.patel@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:19','2026-08-21 23:45:43'),
(17,'Elena Vasquez Torres','e.torres@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:20','2026-08-21 23:45:43'),
(18,'James Kwame Osei','j.osei@gfh.com',NULL,'$2y$12$FMlRUk0TXOShmfou0dQgC.6Gpu8tSV.oKmngKYxxA6D6W4jFChRKy','tenant',NULL,'2026-08-17 07:54:21','2026-08-21 23:45:43');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-08-25 18:28:16
